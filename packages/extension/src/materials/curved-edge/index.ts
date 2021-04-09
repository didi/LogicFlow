
function getCurvedEdgeView(PolylineEdge, h, space) {
  class CurvedEdge extends PolylineEdge {
    static extendKey = 'CurvedEdge';
    getEdge() {
      const {
        points,
        strokeWidth,
        stroke,
        strokeDashArray,
      } = this.getAttributes();
      const points2 = points.split(' ').map((p) => p.split(',').map(a => Number(a)));
      const [startX, startY] = points2[0];
      let d = `M${startX} ${startY}`;
      // 1) 如果一个点不为开始和结束，则在这个点的前后增加弧度开始和结束点。
      // 2) 判断这个点与前一个点的坐标
      //    如果x相同则前一个点的x也不变，
      //    y为（这个点的y 大于前一个点的y, 则 为 这个点的y - 5；小于前一个点的y, 则为这个点的y+5）
      //    同理，判断这个点与后一个点的x,y是否相同，如果x相同，则y进行加减，如果y相同，则x进行加减
      // todo: 好丑，看看怎么优化下
      for (let i = 1; i < points2.length - 1; i++) {
        const [preX, preY] = points2[i - 1];
        const [currentX, currentY] = points2[i];
        const [nextX, nextY] = points2[i + 1];
        if (currentX === preX && currentY !== preY) {
          const y = currentY > preY ? currentY - space : currentY + space;
          d = `${d} L ${currentX} ${y}`;
        }
        if (currentY === preY && currentX !== preX) {
          const x = currentX > preX ? currentX - space : currentX + space;
          d = `${d} L ${x} ${currentY}`;
        }
        d = `${d} Q ${currentX} ${currentY}`;
        if (currentX === nextX && currentY !== nextY) {
          const y = currentY > nextY ? currentY - space : currentY + space;
          d = `${d} ${currentX} ${y}`;
        }
        if (currentY === nextY && currentX !== nextX) {
          const x = currentX > nextX ? currentX - space : currentX + space;
          d = `${d} ${x} ${currentY}`;
        }
      }
      const [endX, endY] = points2[points2.length - 1];
      d = `${d} L ${endX} ${endY}`;
      return h(
        'path',
        {
          d,
          strokeWidth,
          stroke,
          fill: 'none',
          strokeDashArray,
        }
      )
    }
  }
  return CurvedEdge;
}

function getCurvedEdgeModel(PolylineEdgeModel) {
  class CurvedEdgeModel extends PolylineEdgeModel {
    static extendKey = 'CurvedEdgeModel';
  }
  return CurvedEdgeModel;
}

const CurvedEdge = {
  name: 'curved-edge',
  curvedSpace: 5,
  init({ curvedSpace }) {
    CurvedEdge.curvedSpace = curvedSpace;
  },
  install(lf) {
    lf.register('curved-edge', this.registerCurvedEdge);
  },
  registerCurvedEdge({ PolylineEdge, PolylineEdgeModel, h }) {
    return {
      view: getCurvedEdgeView(PolylineEdge, h, CurvedEdge.curvedSpace),
      model: getCurvedEdgeModel(PolylineEdgeModel),
    };
  },
};

export default CurvedEdge;

export {
  CurvedEdge,
};


// import { h } from 'preact';

// function Polyline(props) {
//   const { points } = props;
//   const points2 = points.split(' ').map((p) => p.split(',').map(a => Number(a)));
//   const [startX, startY] = points2[0];
//   let d = `M${startX} ${startY}`;
//   // 1) 如果一个点不为开始和结束，则在这个点的前后增加弧度开始和结束点。
//   // 2) 判断这个点与前一个点的坐标
//   //    如果x相同则前一个点的x也不变，
//   //    y为（这个点的y 大于前一个点的y, 则 为 这个点的y - 5；小于前一个点的y, 则为这个点的y+5）
//   //    同理，判断这个点与后一个点的x,y是否相同，如果x相同，则y进行加减，如果y相同，则x进行加减
//   const space = 5;
//   for (let i = 1; i < points2.length - 1; i++) {
//     const [currentX, currentY] = points2[i];
//     const [preX, preY] = points2[i - 1];
//     const [nextX, nextY] = points2[i + 1];
//     if (currentX === preX && currentY !== preY) {
//       const y = currentY > preY ? currentY - space : currentY + space;
//       d = `${d} L ${currentX} ${y}`;
//     }
//     if (currentY === preY && currentX !== preX) {
//       const x = currentX > preX ? currentX - space : currentX + space;
//       d = `${d} L ${x} ${currentY}`;
//     }
//     d = `${d} Q ${currentX} ${currentY}`;
//     if (currentX === nextX && currentY !== nextY) {
//       const y = currentY > nextY ? currentY - space : currentY + space;
//       d = `${d} ${currentX} ${y}`;
//     }
//     if (currentY === nextY && currentX !== nextX) {
//       const x = currentX > nextX ? currentX - space : currentX + space;
//       d = `${d} ${x} ${currentY}`;
//     }
//   }
//   const [endX, endY] = points2[points2.length - 1];
//   d = `${d} L ${endX} ${endY}`;
//   const attrs = {
//     fill: 'none',
//     ...props,
//     d,
//   };

//   return (
//     // <polyline {...attrs} />
//     <path {...attrs} />
//   );
// }

// export default Polyline;
