import RAPIER from '@dimforge/rapier3d-compat';
import {
  AUTODROME_CONES,
  AUTODROME_ROADS,
  AUTODROME_WALLS,
} from '@/config/autodrom.config';
import { AUTODROM_ISLANDS } from '@/config/islands';
import { AUTODROM_PARKING_AREAS } from '@/config/parking';
import { buildCurbArcFromUV } from '@/features/autodrom/CurbGenerator';
import { buildIslandGeometry } from '@/features/autodrom/IslandGenerator';
import { CollisionManager, type ColliderTag } from '@/physics/CollisionManager';
import { PHYSICS_CONFIG } from '@/physics/PhysicsConfig';

export interface DynamicConeBody {
  id: string;
  body: RAPIER.RigidBody;
  radius: number;
  height: number;
  initialPos: [number, number, number];
}

export class PhysicsWorld {
  readonly world: RAPIER.World;
  readonly collisionManager = new CollisionManager();
  readonly cones: DynamicConeBody[] = [];
  private chassisCollider: RAPIER.Collider | null = null;

  constructor() {
    this.world = new RAPIER.World(PHYSICS_CONFIG.gravity);
    this.buildStaticEnvironment();
  }

  static async create(): Promise<PhysicsWorld> {
    await RAPIER.init();
    return new PhysicsWorld();
  }

  setChassisCollider(collider: RAPIER.Collider): void {
    this.chassisCollider = collider;
    this.collisionManager.register(collider.handle, { kind: 'chassis', id: 'player-vehicle' });
  }

  private buildStaticEnvironment(): void {
    // 1. Ground & Estakada M3 Ramps
    for (const road of AUTODROME_ROADS) {
      if (!road.hasCollider) continue;
      const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
        road.center[0],
        road.center[1],
        road.center[2]
      );

      if (road.slopeRad) {
        const halfAngle = (-road.slopeRad) / 2;
        bodyDesc.setRotation({ x: 0, y: 0, z: Math.sin(halfAngle), w: Math.cos(halfAngle) });
      }
      const body = this.world.createRigidBody(bodyDesc);
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(road.size[0] / 2, 0.05, road.size[1] / 2)
          .setFriction(1.2)
          .setRestitution(0),
        body
      );
      this.collisionManager.register(collider.handle, { kind: 'ground', id: road.id });
    }

    // 2. Exact 8 Green Islands & Raised Curbs (Trimesh synchronized with ExtrudeGeometry)
    for (const isl of AUTODROM_ISLANDS) {
      const { geometry } = buildIslandGeometry(isl);
      const posAttr = geometry.getAttribute('position');
      const vertices = new Float32Array(posAttr.array);
      const indices = new Uint32Array(posAttr.count);
      for (let i = 0; i < posAttr.count; i++) indices[i] = i;

      const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.trimesh(vertices, indices).setFriction(0.8).setRestitution(0.05),
        body
      );
      this.collisionManager.register(collider.handle, { kind: 'curb', id: isl.id });
      geometry.dispose();
    }

    // 3. Diagonal Parking Rounded Curb Arc
    for (const area of AUTODROM_PARKING_AREAS) {
      const curbGeo = buildCurbArcFromUV(area.curbArcUV, 0.26, 0.14);
      const posAttr = curbGeo.getAttribute('position');
      const indexAttr = curbGeo.getIndex();
      if (posAttr && indexAttr) {
        const vertices = new Float32Array(posAttr.array);
        const indices = new Uint32Array(indexAttr.array);
        const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
        const collider = this.world.createCollider(
          RAPIER.ColliderDesc.trimesh(vertices, indices).setFriction(0.7),
          body
        );
        this.collisionManager.register(collider.handle, { kind: 'curb', id: area.id });
      }
      curbGeo.dispose();
    }

    // 4. Perimeter Fences & Estakada Guard Barriers
    for (const wall of AUTODROME_WALLS) {
      const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(
        wall.center[0],
        wall.center[1],
        wall.center[2]
      );
      if (wall.rotationYDeg) {
        const rad = (wall.rotationYDeg * Math.PI) / 180;
        bodyDesc.setRotation({ x: 0, y: Math.sin(rad / 2), z: 0, w: Math.cos(rad / 2) });
      }
      const body = this.world.createRigidBody(bodyDesc);
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.cuboid(wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2)
          .setFriction(0.6)
          .setRestitution(0.1),
        body
      );
      this.collisionManager.register(collider.handle, { kind: wall.kind, id: wall.id });
    }

    // 5. Physical Dynamic Traffic Cones
    for (const cone of AUTODROME_CONES) {
      const halfH = cone.heightMeters / 2;
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(cone.position[0], cone.position[1] + halfH + 0.01, cone.position[2])
          .setLinearDamping(1.5)
          .setAngularDamping(2.0)
      );
      const collider = this.world.createCollider(
        RAPIER.ColliderDesc.cylinder(halfH, cone.radiusMeters * 0.75)
          .setMass(2.5)
          .setFriction(0.8)
          .setRestitution(0.15),
        body
      );
      this.collisionManager.register(collider.handle, { kind: 'cone', id: cone.id });
      this.cones.push({
        id: cone.id,
        body,
        radius: cone.radiusMeters,
        height: cone.heightMeters,
        initialPos: cone.position,
      });
    }
  }

  resetCones(): void {
    for (const c of this.cones) {
      c.body.setTranslation(
        { x: c.initialPos[0], y: c.initialPos[1] + c.height / 2 + 0.01, z: c.initialPos[2] },
        true
      );
      c.body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      c.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      c.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }

  getActiveVehicleContacts(): ColliderTag[] {
    if (!this.chassisCollider) return [];
    const hits: ColliderTag[] = [];
    this.world.contactPairsWith(this.chassisCollider, (otherCollider) => {
      const tag = this.collisionManager.getTag(otherCollider.handle);
      if (tag && tag.kind !== 'ground' && tag.kind !== 'chassis') {
        hits.push(tag);
      }
    });
    return hits;
  }

  step(): void {
    this.world.step();
  }

  dispose(): void {
    this.collisionManager.clear();
    this.world.free();
  }
}
