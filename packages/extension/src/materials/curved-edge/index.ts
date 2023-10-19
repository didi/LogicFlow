import {
  PointTuple,
  PolylineEdge,
  PolylineEdgeModel,
  h,
} from '@logicflow/core';

type DirectionType = 't' | 'b' | 'l' | 'r' | '';
type ArcPositionType = 'tl' | 'tr' | 'bl' | 'br' | '-';

const directionMap: any = {
  tr: 'tl',
  lb: 'tl',
  tl: 'tr',
  rb: 'tr',
  br: 'bl',
  lt: 'bl',
  bl: 'br',
  rt: 'br',
};

function pointFilter(points: number[][]) {
  const all = points;
  let i = 1;
  while (i < all.length - 1) {
    const [x, y] = all[i - 1];
    const [x1, y1] = all[i];
    const [x2, y2] = all[i + 1];
    if ((x === x1 && x1 === x2) || (y === y1 && y1 === y2)) {
      all.splice(i, 1);
    } else {
      i++;
    }
  }
  return all;
}

function getMidPoints(
  cur: PointTuple,
  key: string,
  orientation: ArcPositionType,
  radius: number,
) {
  const mid1 = [cur[0], cur[1]];
  const mid2 = [cur[0], cur[1]];
  switch (orientation) {
    case 'tl': {
      if (key === 'tr') {
        mid1[1] += radius;
        mid2[0] += radius;
      } else if (key === 'lb') {
        mid1[0] += radius;
        mid2[1] += radius;
      }
      return [mid1, mid2];
    }
    case 'tr': {
      if (key === 'tl') {
        mid1[1] += radius;
        mid2[0] -= radius;
      } else if (key === 'rb') {
        mid1[0] -= radius;
        mid2[1] += radius;
      }
      return [mid1, mid2];
    }
    case 'bl': {
      if (key === 'br') {
        mid1[1] -= radius;
        mid2[0] += radius;
      } else if (key === 'lt') {
        mid1[0] += radius;
        mid2[1] -= radius;
      }
      return [mid1, mid2];
    }
    case 'br': {
      if (key === 'bl') {
        mid1[1] -= radius;
        mid2[0] -= radius;
      } else if (key === 'rt') {
        mid1[0] -= radius;
        mid2[1] -= radius;
      }
      return [mid1, mid2];
    }
    default:
      return null;
  }
}

function getPath(
  prev: PointTuple,
  cur: PointTuple,
  next: PointTuple,
  radius: number,
): string {
  let dir1: DirectionType = '';
  let dir2: DirectionType = '';
  let realRadius = radius;

  if (prev[0] === cur[0]) {
    dir1 = prev[1] > cur[1] ? 't' : 'b';
    realRadius = Math.min(Math.abs(prev[0] - cur[0]), radius);
  } else if (prev[1] === cur[1]) {
    dir1 = prev[0] > cur[0] ? 'l' : 'r';
    realRadius = Math.min(Math.abs(prev[1] - cur[1]), radius);
  }
  if (cur[0] === next[0]) {
    dir2 = cur[1] > next[1] ? 't' : 'b';
    realRadius = Math.min(Math.abs(prev[0] - cur[0]), radius);
  } else if (cur[1] === next[1]) {
    dir2 = cur[0] > next[0] ? 'l' : 'r';
    realRadius = Math.min(Math.abs(prev[1] - cur[1]), radius);
  }

  const key = `${dir1}${dir2}`;
  const orientation: ArcPositionType = directionMap[key] || '-';
  let path = `L ${prev[0]} ${prev[1]}`;
  if (orientation === '-') {
    path += `L ${cur[0]} ${cur[1]} L ${next[0]} ${next[1]}`;
  } else {
    const [mid1, mid2] = getMidPoints(cur, key, orientation, (realRadius)) || [];
    if (mid1 && mid2) {
      path += `L ${mid1[0]} ${mid1[1]} Q ${cur[0]} ${cur[1]} ${mid2[0]} ${mid2[1]}`;
      [cur[0], cur[1]] = mid2;
    }
  }
  return path;
}

class CurvedEdge extends PolylineEdge {
  getEdge() {
    const { model } = this.props;
    const { points: pointsStr, isAnimation, arrowConfig, radius = 5 } = model;
    const style = model.getEdgeStyle();
    const animationStyle = model.getEdgeAnimationStyle();
    const points = pointFilter(
      pointsStr.split(' ').map((p) => p.split(',').map((a) => +a)),
    );
    let i = 0;
    let d = '';
    if (points.length === 2) {
      d += `M${points[i][0]} ${points[i++][1]} L ${points[i][0]} ${
        points[i][1]
      }`;
    } else {
      d += `M${points[i][0]} ${points[i++][1]}`;
      for (; i + 1 < points.length;) {
        const prev = points[i - 1] as PointTuple;
        const cur = points[i] as PointTuple;
        const next = points[i++ + 1] as PointTuple;
        d += getPath(prev, cur, next, radius as number);
      }
      d += `L ${points[i][0]} ${points[i][1]}`;
    }

    const attrs = {
      style: isAnimation ? animationStyle : {},
      ...style,
      ...arrowConfig,
      fill: 'none',
    };
    console.log(d);
    return h('path', {
      d,
      ...attrs,
    });
  }
}

class CurvedEdgeModel extends PolylineEdgeModel {}

const defaultCurvedEdge = {
  type: 'curved-edge',
  view: CurvedEdge,
  model: CurvedEdgeModel,
};

export default defaultCurvedEdge;

export {
  CurvedEdge,
  CurvedEdgeModel,
};
