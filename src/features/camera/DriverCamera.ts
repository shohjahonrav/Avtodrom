import * as THREE from 'three';
import { COBALT_DRIVER_EYE_LOCAL } from '@/config/vehicle.config';

const _eyePos = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

export function updateDriverCamera(params: {
  camera: THREE.PerspectiveCamera;
  vehiclePos: THREE.Vector3;
  vehicleQuat: THREE.Quaternion;
}): void {
  const { camera, vehiclePos, vehicleQuat } = params;
  _eyePos
    .set(COBALT_DRIVER_EYE_LOCAL[0], COBALT_DRIVER_EYE_LOCAL[1], COBALT_DRIVER_EYE_LOCAL[2])
    .applyQuaternion(vehicleQuat)
    .add(vehiclePos);

  camera.position.copy(_eyePos);

  _lookTarget
    .set(COBALT_DRIVER_EYE_LOCAL[0], COBALT_DRIVER_EYE_LOCAL[1] - 0.12, -16.0)
    .applyQuaternion(vehicleQuat)
    .add(vehiclePos);

  camera.lookAt(_lookTarget);
}
