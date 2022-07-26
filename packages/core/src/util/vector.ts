import { DirectionVector2, Point, Vector2 } from '../type';

export const getDirectionVector = (point1: Point, point2: Point): DirectionVector2 => {
  let a = point2.x - point1.x;
  let b = point2.y - point1.y;
  if (a !== 0) {
    a = a / Math.abs(a);
  }
  if (b !== 0) {
    b = b / Math.abs(b);
  }
  return [a, b] as DirectionVector2;
};

export const isSameDirection = (v1: DirectionVector2, v2: DirectionVector2): boolean => (
  v1[0] === v2[0] && v1[1] === v2[1]
);

export const isContraryDirection = (v1: DirectionVector2, v2: DirectionVector2): boolean => (
  !((v1[0] + v2[0]) || (v1[1] + v2[1]))
);
