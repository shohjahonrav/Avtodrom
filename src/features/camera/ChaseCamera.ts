import * as THREE from 'three';

const _offset = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();

export function updateChaseCamera(params: {
  camera: THREE.PerspectiveCamera;
  vehiclePos: THREE.Vector3;
  vehicleQuat: THREE.Quaternion;
  distance: number;
  height: number;
  dt: number;
}): void {
  const { camera, vehiclePos, vehicleQuat, distance, height, dt } = params;
  // Vehicle forward is -Z, so behind is +Z
  _offset.set(0, height, distance).applyQuaternion(vehicleQuat);
  _targetPos.copy(vehiclePos).add(_offset);
  // Prevent ground clipping
  _targetPos.y = Math.max(0.65, _targetPos.y);

  const smooth = 1 - Math.exp(-7.5 * dt);
  camera.position.lerp(_targetPos, smooth);

  _lookAt.set(0, 0.65, -4.5).applyQuaternion(vehicleQuat).add(vehiclePos);
  camera.lookAt(_lookAt);
}
