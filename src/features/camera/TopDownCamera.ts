import * as THREE from 'three';

const _targetPos = new THREE.Vector3();

export function updateTopDownCamera(params: {
  camera: THREE.PerspectiveCamera;
  vehiclePos: THREE.Vector3;
  height: number;
  dt: number;
}): void {
  const { camera, vehiclePos, height, dt } = params;
  _targetPos.set(vehiclePos.x, Math.max(12, height), vehiclePos.z + 0.01);
  const smooth = 1 - Math.exp(-8 * dt);
  camera.position.lerp(_targetPos, smooth);
  camera.lookAt(vehiclePos.x, vehiclePos.y, vehiclePos.z);
}
