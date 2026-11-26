import { describe, expect, it } from 'vitest';
import {
  AUTODROME_CONES,
  AUTODROME_SIGNS_3D,
  DEFAULT_EXAM_RULES_3D,
  EXAM_EXERCISES_ORDER,
} from '@/config/autodrom.config';
import { AUTODROM_ISLANDS } from '@/config/islands';
import { MAP_DIMENSIONS } from '@/config/mapDimensions';
import {
  AUTODROM_ARROWS_CONFIG,
  AUTODROM_MARKINGS_CONFIG,
  B_LANE_CENTER_Z,
  CD_LANE_CENTER_Z,
  EST_CLIMB_START_X,
  ESTAKADA_M3_SPEC,
  PED_ZEBRA_CENTER_X,
  START_LINE_X,
} from '@/config/markings';
import { AUTODROM_PARKING_AREAS } from '@/config/parking';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import { buildAutodromSceneData } from '@/features/autodrom/AutodromBuilder';
import { ExamManager } from '@/features/examination/ExamManager';
import { computeExamResults } from '@/features/examination/ExamResults';
import { detectFrameViolationsAndZones } from '@/features/examination/ViolationDetector';
import { VehicleController } from '@/features/vehicle/VehicleController';
import { PHYSICS_CONFIG } from '@/physics/PhysicsConfig';
import { PhysicsWorld } from '@/physics/PhysicsWorld';

describe('3D Rapier Physics & Chevrolet Cobalt Vehicle Controller', () => {
  it('initializes Rapier world, spawns Cobalt on ground with 4 wheel contacts, and accelerates/steers/brakes/reverses', async () => {
    const pw = await PhysicsWorld.create();
    const spawn = EXAM_EXERCISES_ORDER[0].spawnPose;
    const ctrl = new VehicleController(pw, spawn.position, spawn.yawDeg, COBALT_VEHICLE_CONFIG);

    // Let vehicle settle on ground with clutch released (0)
    for (let i = 0; i < 30; i++) {
      ctrl.step({ throttle: 0, brake: 1, steerLeft: false, steerRight: false, clutch: 0 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }

    const settled = ctrl.getTelemetry();
    expect(settled.wheelContacts).toEqual([true, true, true, true]);
    expect(settled.position[1]).toBeGreaterThan(0.2);
    expect(settled.position[1]).toBeLessThan(1.2);

    // Manual gearbox requires clutch to shift into 1st gear
    expect(ctrl.requestGear('1').accepted).toBe(false);
    for (let i = 0; i < 15; i++) {
      ctrl.step({ throttle: 0, brake: 1, steerLeft: false, steerRight: false, clutch: 1 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }
    expect(ctrl.requestGear('1').accepted).toBe(true);
    ctrl.setHandbrake(false);

    // Release clutch & accelerate forward while steering left
    for (let i = 0; i < 60; i++) {
      ctrl.step({ throttle: 0.8, brake: 0, steerLeft: true, steerRight: false, clutch: 0 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }

    const moving = ctrl.getTelemetry();
    expect(moving.speedKmh).toBeGreaterThan(5);
    expect(moving.steeringAngleDeg).toBeGreaterThan(5);
    expect(Math.abs(ctrl.getWheelPoses()[0].spinAngleRad)).toBeGreaterThan(0.5);

    // Full braking brings speed down
    for (let i = 0; i < 60; i++) {
      ctrl.step({ throttle: 0, brake: 1, steerLeft: false, steerRight: false, clutch: 1 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }
    const braked = ctrl.getTelemetry();
    expect(braked.speedKmh).toBeLessThan(2);

    // Shift to Reverse and drive backward
    expect(ctrl.requestGear('R').accepted).toBe(true);
    for (let i = 0; i < 45; i++) {
      ctrl.step({ throttle: 0.7, brake: 0, steerLeft: false, steerRight: false, clutch: 0 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }
    const reversing = ctrl.getTelemetry();
    expect(reversing.signedSpeedMps).toBeLessThan(-0.5);

    // Reset restores start pose and neutral + handbrake
    ctrl.reset(spawn);
    const resetTel = ctrl.getTelemetry();
    expect(resetTel.gear).toBe('N');
    expect(resetTel.handbrake).toBe(true);

    pw.dispose();
  });

  it('stalls engine when launching in 4th gear without throttle', async () => {
    const pw = await PhysicsWorld.create();
    const spawn = EXAM_EXERCISES_ORDER[0].spawnPose;
    const ctrl = new VehicleController(pw, spawn.position, spawn.yawDeg, COBALT_VEHICLE_CONFIG);

    for (let i = 0; i < 20; i++) {
      ctrl.step({ throttle: 0, brake: 0, steerLeft: false, steerRight: false, clutch: 1 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }
    expect(ctrl.requestGear('4').accepted).toBe(true);
    ctrl.setHandbrake(false);

    let stalled = false;
    for (let i = 0; i < 30; i++) {
      const res = ctrl.step({ throttle: 0, brake: 0, steerLeft: false, steerRight: false, clutch: 0 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
      if (res.justStalled) stalled = true;
    }

    expect(stalled).toBe(true);
    expect(ctrl.getTelemetry().stalled).toBe(true);
    pw.dispose();
  });
});

describe('3D Examination Boundary Footprint, Rapier Collisions & Results', () => {
  it('detects 4-corner footprint boundary violation even when center is inside lane', () => {
    // Outer south white line m-outer-s is at v = 0.992; vehicle center 1.4m inside extends halfLen=2.235 past boundary
    const southEdgeZ = (0.992 - 0.5) * MAP_DIMENSIONS.mapLengthMeters;
    const check = detectFrameViolationsAndZones({
      vehiclePos: [0, 0.4, southEdgeZ - 1.4],
      yawRad: 0,
      vehicleConfig: COBALT_VEHICLE_CONFIG,
      rapierContacts: [],
      activeExerciseId: 'start',
    });
    expect(check.boundaryCrossingIds).toContain('m-outer-s');
  });

  it('includes all 8 blueprint islands, 11 diagonal parking lines, 5 zebras, and M1-M12 checkpoints', () => {
    const data = buildAutodromSceneData();
    expect(AUTODROM_ISLANDS).toHaveLength(8);
    expect(AUTODROM_PARKING_AREAS[0].stallLinesUV).toHaveLength(11);
    expect(data.zebraStripes).toHaveLength(4 * 7 + 8);
    expect(EXAM_EXERCISES_ORDER).toHaveLength(12);
  });

  it('matches B-category START -> M2 pedestrian crossing -> M3 Estakada 2-lane distances and signs', () => {
    const spawn = EXAM_EXERCISES_ORDER[0].spawnPose;
    // Cobalt spawns right before START line in right-hand (B) lane facing East
    expect(spawn.position[0]).toBeLessThan(START_LINE_X);
    expect(spawn.position[2]).toBeCloseTo(B_LANE_CENTER_Z, 2);
    expect(CD_LANE_CENTER_Z).toBeLessThan(B_LANE_CENTER_Z);

    // 9-10m from START line to M2 pedestrian crossing + 7-8m from crossing to Estakada climb + 3-4m top plateau
    expect(PED_ZEBRA_CENTER_X - START_LINE_X).toBeGreaterThanOrEqual(9.0);
    expect(PED_ZEBRA_CENTER_X - START_LINE_X).toBeLessThanOrEqual(10.0);
    expect(EST_CLIMB_START_X - (PED_ZEBRA_CENTER_X + 1.1)).toBeGreaterThanOrEqual(7.0);
    expect(EST_CLIMB_START_X - (PED_ZEBRA_CENTER_X + 1.1)).toBeLessThanOrEqual(8.2);
    expect(ESTAKADA_M3_SPEC.plateauLengthMeters).toBeGreaterThanOrEqual(3.0);
    expect(ESTAKADA_M3_SPEC.plateauLengthMeters).toBeLessThanOrEqual(4.0);

    // Continuous solid divider (1.1) -> 2.0m solid after SE turn -> 1.5 dashed ending before B's 90° left turn
    const southDiv = AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-2lane-south-div');
    const eastSolid = AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-2lane-east-solid');
    const eastDash = AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-2lane-east-dash');
    expect(southDiv?.kind).toBe('solid_white');
    expect(eastSolid?.kind).toBe('solid_white');
    expect(eastDash?.kind).toBe('dashed_white');
    expect(
      Math.abs((eastSolid!.startUV.v - eastSolid!.endUV.v) * MAP_DIMENSIONS.mapLengthMeters)
    ).toBeCloseTo(2.0, 1);
    expect(eastDash!.endUV.v).toBeGreaterThanOrEqual(0.61);
    expect(ESTAKADA_M3_SPEC.widthMeters).toBeGreaterThanOrEqual(5.8);
    expect(AUTODROM_MARKINGS_CONFIG.some((m) => m.id === 'm-est-stop-112')).toBe(true);
    expect(AUTODROM_MARKINGS_CONFIG.filter((m) => m.id.startsWith('m-outer-se-arc-'))).toHaveLength(12);
    expect(AUTODROM_MARKINGS_CONFIG.filter((m) => m.id.startsWith('m-2lane-se-arc-'))).toHaveLength(12);

    // East northbound lane arrows: C/D turns left into 1st M4 (no straight arrow), B goes straight then turns left at B's M4
    const arrCd = AUTODROM_ARROWS_CONFIG.find((a) => a.id === 'arr-e-cd');
    const arrB = AUTODROM_ARROWS_CONFIG.find((a) => a.id === 'arr-e-b');
    const arrBM4 = AUTODROM_ARROWS_CONFIG.find((a) => a.id === 'arr-e-b-m4');
    expect(arrCd?.kind).toBe('left_turn');
    expect(arrCd!.positionUV.u).toBeLessThan(0.956);
    expect(arrB?.kind).toBe('straight');
    expect(arrB!.positionUV.u).toBeGreaterThan(0.956);
    expect(arrBM4?.kind).toBe('left_turn');
    expect(arrBM4!.positionUV.u).toBeGreaterThan(0.956);

    // M4 90° entry/exit dashed yellow gates (2m before 1st turn & 2m after last turn) + continuous yellow borders
    expect(AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-yel-m4-b-in')?.kind).toBe('dashed_yellow');
    expect(AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-yel-m4-b-out')?.kind).toBe('dashed_yellow');
    expect(AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-yel-m4-cd-in')?.kind).toBe('dashed_yellow');
    expect(AUTODROM_MARKINGS_CONFIG.find((m) => m.id === 'm-yel-m4-cd-out')?.kind).toBe('dashed_yellow');
    expect(
      AUTODROM_MARKINGS_CONFIG.filter((m) => m.id.startsWith('m-yel-m4-') && m.kind === 'bay_yellow_border')
    ).toHaveLength(12);

    // All opposing-direction centerlines (especially south approach after M4 right turn) are continuous solid white
    for (const id of ['m-vert-s-solid', 'm-vert-n-solid', 'm-horiz-w-solid', 'm-horiz-e-solid']) {
      expect(AUTODROM_MARKINGS_CONFIG.find((m) => m.id === id)?.kind).toBe('solid_white');
    }
    const signCodes = new Set(AUTODROME_SIGNS_3D.map((s) => s.code));
    expect(signCodes.has('5.16.2')).toBe(true);
    expect(signCodes.has('2.5')).toBe(true);
    expect(signCodes.has('1.14')).toBe(true);
    expect(signCodes.has('1.13')).toBe(true);
  });

  it('records cone collision and checkpoint completion in ExamManager', () => {
    const mgr = new ExamManager();
    const startCenter = EXAM_EXERCISES_ORDER[0].checkpointCenter;
    const tel = {
      speedKmh: 15,
      signedSpeedMps: 4.1,
      rpm: 1800,
      gear: '1' as const,
      throttle: 0.4,
      brake: 0,
      clutch: 0,
      handbrake: false,
      steeringAngleDeg: 0,
      steeringInput: 0,
      engineRunning: true,
      stalled: false,
      leftIndicator: false,
      rightIndicator: false,
      hazardLights: false,
      headlights: false,
      position: [startCenter[0], 0.4, startCenter[2]] as [number, number, number],
      yawRad: -Math.PI / 2,
      wheelContacts: [true, true, true, true] as [boolean, boolean, boolean, boolean],
      wheelSuspensionLengths: [0.22, 0.22, 0.22, 0.22] as [number, number, number, number],
    };

    mgr.step({
      dt: 1 / 60,
      mode: 'exam',
      telemetry: tel,
      vehicleConfig: COBALT_VEHICLE_CONFIG,
      rapierContacts: [{ kind: 'cone', id: 'cone-m6-1' }],
      rules: DEFAULT_EXAM_RULES_3D,
      justStalled: false,
    });

    expect(mgr.state.completedExerciseIds).toContain('start');
    expect(mgr.state.currentExerciseIndex).toBe(1);
    expect(mgr.state.violations.some((v) => v.type === 'CONE_COLLISION')).toBe(true);

    const results = computeExamResults(mgr.state.violations, true, DEFAULT_EXAM_RULES_3D);
    expect(results.completed).toBe(true);
    expect(results.customScore).toBeUndefined();
  });

  it('registers actual Rapier3D physics contact when colliding with a cone', async () => {
    const pw = await PhysicsWorld.create();
    const cone0 = AUTODROME_CONES[0];
    // Spawn 2.8m west of cone-m6-1 facing East (-90 deg) and drive directly into it
    const ctrl = new VehicleController(
      pw,
      [cone0.position[0] - 2.8, 0.38, cone0.position[2]],
      -90,
      COBALT_VEHICLE_CONFIG
    );
    for (let i = 0; i < 12; i++) {
      ctrl.step({ throttle: 0, brake: 1, steerLeft: false, steerRight: false, clutch: 1 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
    }
    ctrl.requestGear('1');
    ctrl.setHandbrake(false);

    let sawConeContact = false;
    for (let i = 0; i < 70; i++) {
      ctrl.step({ throttle: 0.9, brake: 0, steerLeft: false, steerRight: false, clutch: 0 }, PHYSICS_CONFIG.fixedTimestep);
      pw.step();
      const hits = pw.getActiveVehicleContacts();
      if (hits.some((h) => h.kind === 'cone' && h.id === cone0.id)) {
        sawConeContact = true;
        break;
      }
    }
    expect(sawConeContact).toBe(true);
    pw.dispose();
  });
});
