import { describe, expect, it } from 'vitest';
import { EXERCISES_B, getExerciseBySlug } from '@/features/exercises/data/exercisesB';
import { detectCollisionsAndZones } from '@/features/simulation/collision/collisionDetector';
import { stepSimulation } from '@/features/simulation/engine/simulationStep';
import { stepVehiclePhysics } from '@/features/simulation/engine/vehiclePhysics';
import { evaluateSessionResult } from '@/features/simulation/scoring/ruleEvaluator';
import { AdminScoringConfigSchema, ExerciseConfigSchema } from '@/lib/validators/configSchema';
import { DEFAULT_ADMIN_CONFIG } from '@/stores/useAppStore';
import { buildInitialSnapshot } from '@/stores/useSimulationStore';

describe('Exercise & Admin Configurations', () => {
  it('has all 12 official B-category exercises in order and passes Zod validation', () => {
    expect(EXERCISES_B).toHaveLength(12);
    expect(EXERCISES_B.map((e) => e.slug)).toEqual([
      'start',
      'pedestrian-crossing',
      'estakada',
      'turn-90',
      'reverse-box',
      'regulated-intersection',
      'slalom',
      'parallel-parking',
      'railway-crossing',
      'acceleration-lane',
      'emergency-stop',
      'finish',
    ]);

    for (const ex of EXERCISES_B) {
      const parsed = ExerciseConfigSchema.safeParse(ex);
      expect(parsed.success, `Failed schema for ${ex.slug}`).toBe(true);
    }

    expect(AdminScoringConfigSchema.safeParse(DEFAULT_ADMIN_CONFIG).success).toBe(true);
  });
});

describe('Simulation Collision, Physics & Rule Evaluation', () => {
  it('triggers LINE_CROSSING when vehicle crosses 1.1 boundary line', () => {
    const ex = getExerciseBySlug('start')!;
    const snap = buildInitialSnapshot(ex, 'practice', 'manual', true);
    // Move vehicle onto top 1.1 boundary line (y = 1.2)
    snap.vehicle.y = 1.3;
    snap.controls.throttle = 0.4;

    const { snapshot, collisionReport } = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(collisionReport.violatedLineIds.length).toBeGreaterThan(0);
    expect(snapshot.events.some((e) => e.code === 'LINE_CROSSING')).toBe(true);
  });

  it('detects cone collision in Slalom (ilon izi)', () => {
    const ex = getExerciseBySlug('slalom')!;
    const snap = buildInitialSnapshot(ex, 'practice', 'manual', true);
    // Cone 1 is at (7.5, 4.0)
    snap.vehicle.x = 7.5;
    snap.vehicle.y = 4.0;

    const { snapshot, collisionReport } = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(collisionReport.collidedConeIds).toContain('sl-c1');
    expect(snapshot.events.some((e) => e.code === 'CONE_COLLISION')).toBe(true);
  });

  it('distinguishes stopping before 1.12 stop line vs overshooting on Estakada', () => {
    const ex = getExerciseBySlug('estakada')!;
    // Case 1: Stop before 1.12 line (x = 8.6) inside estakada_stop_box (x = 4.5..8.6)
    let snapStop = buildInitialSnapshot(ex, 'practice', 'manual', true);
    snapStop.vehicle.x = 6.5;
    snapStop.vehicle.y = 3.5;
    snapStop.vehicle.speedMps = 0;
    snapStop.controls.brake = 1;
    snapStop.controls.throttle = 0;

    for (let i = 0; i < 16; i++) {
      snapStop = stepSimulation(snapStop, ex, DEFAULT_ADMIN_CONFIG, 0.05).snapshot;
    }
    expect(snapStop.exerciseState.estakadaStopCompleted).toBe(true);
    expect(snapStop.events.some((e) => e.code === 'ESTAKADA_STOP_LINE_OVERSHOOT')).toBe(false);

    // Case 2: Overshoot 1.12 line without stopping
    const snapOvershoot = buildInitialSnapshot(ex, 'practice', 'manual', true);
    snapOvershoot.vehicle.x = 8.7;
    snapOvershoot.vehicle.y = 3.5;
    snapOvershoot.vehicle.speedMps = 2.0;

    const out = stepSimulation(snapOvershoot, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(out.snapshot.events.some((e) => e.code === 'ESTAKADA_STOP_LINE_OVERSHOOT')).toBe(true);
  });

  it('models estakada rollback physics and logs ESTAKADA_ROLLBACK when rolling past threshold', () => {
    const ex = getExerciseBySlug('estakada')!;
    let snap = buildInitialSnapshot(ex, 'practice', 'manual', true);
    // Put vehicle on climb zone without handbrake, brake, or throttle
    snap.vehicle.x = 6.0;
    snap.vehicle.y = 3.5;
    snap.vehicle.speedMps = 0;
    snap.controls.handbrake = false;
    snap.controls.brake = 0;
    snap.controls.throttle = 0;
    snap.controls.gear = 'N';

    for (let i = 0; i < 30; i++) {
      snap = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05).snapshot;
    }
    expect(snap.vehicle.speedMps).toBeLessThan(0);
    expect(snap.vehicle.maxRollbackObservedMeters).toBeGreaterThan(0.3);
    expect(snap.events.some((e) => e.code === 'ESTAKADA_ROLLBACK')).toBe(true);

    // Now verify handbrake holds vehicle stationary on 12% slope
    const heldVehicle = stepVehiclePhysics(
      {
        x: 6,
        y: 3.5,
        headingRad: 0,
        speedMps: 0,
        steeringAngleRad: 0,
        rpm: 800,
        stalled: false,
        onSlopeGrade: 0.12,
        rollbackDistanceMeters: 0,
        maxRollbackObservedMeters: 0,
      },
      { ...snap.controls, handbrake: true },
      DEFAULT_ADMIN_CONFIG.vehicleDimensions,
      'manual',
      0.12,
      0.05
    );
    expect(heldVehicle.nextVehicle.speedMps).toBe(0);
  });

  it('handles traffic light red violation vs safe green passage', () => {
    const ex = getExerciseBySlug('regulated-intersection')!;
    const snapRed = buildInitialSnapshot(ex, 'practice', 'manual', true);
    // Traffic light starts in 'red'; enter intersection_box (x = 4.5..9.5)
    snapRed.vehicle.x = 7.0;
    snapRed.vehicle.y = 3.2;
    snapRed.vehicle.speedMps = 3.0;

    const redOut = stepSimulation(snapRed, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(redOut.snapshot.events.some((e) => e.code === 'RED_LIGHT_VIOLATION')).toBe(true);

    // Advance timer into green phase (red 6s + yellow 2s = 8s -> at 9s it's green)
    const snapGreen = buildInitialSnapshot(ex, 'practice', 'manual', true);
    snapGreen.exerciseState.trafficLightTimerSec = 9.0;
    snapGreen.vehicle.x = 7.0;
    snapGreen.vehicle.y = 3.2;
    snapGreen.vehicle.speedMps = 3.0;

    const greenOut = stepSimulation(snapGreen, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(greenOut.snapshot.events.some((e) => e.code === 'RED_LIGHT_VIOLATION')).toBe(false);
  });

  it('triggers pedestrian scenario and flags failure if crossing zebra while active', () => {
    const ex = getExerciseBySlug('pedestrian-crossing')!;
    let snap = buildInitialSnapshot(ex, 'practice', 'manual', true);
    // Move near crosswalk (triggerDistanceMeters = 5.0 from x = 8.0)
    snap.vehicle.x = 4.0;
    snap.vehicle.y = 3.5;
    snap = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05).snapshot;
    expect(snap.exerciseState.pedestrianActive).toBe(true);

    // Enter zebra while pedestrian is actively crossing
    snap.vehicle.x = 8.0;
    snap.vehicle.y = 3.5;
    snap = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05).snapshot;
    expect(snap.events.some((e) => e.code === 'PEDESTRIAN_YIELD_FAIL')).toBe(true);
  });

  it('checks vehicle OBB boundaries in Parallel Parking bay and parked car collision', () => {
    const ex = getExerciseBySlug('parallel-parking')!;
    const dims = DEFAULT_ADMIN_CONFIG.vehicleDimensions;

    // Centered cleanly inside bay (x: 5.7..12.5, y: 5.1..7.8)
    const insideReport = detectCollisionsAndZones(
      {
        x: 9.1,
        y: 6.45,
        headingRad: 0,
        speedMps: 0,
        steeringAngleRad: 0,
        rpm: 800,
        stalled: false,
        onSlopeGrade: 0,
        rollbackDistanceMeters: 0,
        maxRollbackObservedMeters: 0,
      },
      dims,
      ex,
      null
    );
    expect(insideReport.isFullyInsideParkingBay).toBe(true);
    expect(insideReport.collidedBarrierIds).toHaveLength(0);

    // Hitting the front parked car barrier (x: 13.0..16.7, y: 6.5)
    const hitReport = detectCollisionsAndZones(
      {
        x: 12.2,
        y: 6.5,
        headingRad: 0,
        speedMps: 0,
        steeringAngleRad: 0,
        rpm: 800,
        stalled: false,
        onSlopeGrade: 0,
        rollbackDistanceMeters: 0,
        maxRollbackObservedMeters: 0,
      },
      dims,
      ex,
      null
    );
    expect(hitReport.collidedBarrierIds).toContain('pp-front-car');
  });

  it('completes START exercise upon crossing start line and reaching exit zone', () => {
    const ex = getExerciseBySlug('start')!;
    let snap = buildInitialSnapshot(ex, 'exam', 'manual', true);
    snap.vehicle.x = 7.7; // inside start_line
    snap = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05).snapshot;
    expect(snap.exerciseState.crossedStart).toBe(true);

    snap.vehicle.x = 14.5; // inside exercise_exit
    const exitOut = stepSimulation(snap, ex, DEFAULT_ADMIN_CONFIG, 0.05);
    expect(exitOut.exerciseJustCompleted).toBe(true);
    expect(exitOut.snapshot.exerciseState.status).toBe('completed');
  });

  it('evaluates session outcome without inventing scores by default, and scores when custom enabled', () => {
    const ex = getExerciseBySlug('start')!;
    const defaultRes = evaluateSessionResult([], true, DEFAULT_ADMIN_CONFIG);
    expect(defaultRes.outcome).toBe('success');
    expect(defaultRes.customScore).toBeUndefined();

    const customCfg = { ...DEFAULT_ADMIN_CONFIG, enableCustomScoring: true };
    const scoredRes = evaluateSessionResult(
      [
        {
          id: 'e1',
          timestampSec: 5,
          exerciseSlug: ex.slug,
          exerciseTitle: ex.shortTitle,
          code: 'LINE_CROSSING',
          message: 'Test',
          severity: 'serious',
          position: { x: 1, y: 1 },
        },
      ],
      true,
      customCfg
    );
    expect(scoredRes.outcome).toBe('completed_with_errors');
    expect(scoredRes.customScore).toBe(85);
    expect(scoredRes.customPassed).toBe(true);
  });
});
