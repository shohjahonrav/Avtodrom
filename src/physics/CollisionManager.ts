export type ColliderTagKind =
  | 'ground'
  | 'fence'
  | 'estakada_guard'
  | 'box_wall'
  | 'parked_car'
  | 'curb'
  | 'cone'
  | 'chassis';

export interface ColliderTag {
  kind: ColliderTagKind;
  id: string;
}

export class CollisionManager {
  private tags = new Map<number, ColliderTag>();

  register(handle: number, tag: ColliderTag): void {
    this.tags.set(handle, tag);
  }

  getTag(handle: number): ColliderTag | undefined {
    return this.tags.get(handle);
  }

  clear(): void {
    this.tags.clear();
  }
}
