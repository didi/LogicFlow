/**
 * 分组节点
 */
// import { h } from '@logicflow/core';
// import { GroupNode } from '@logicflow/extension';

export default function registerGroup(lf) {
  class IvrGroupModel extends GroupNode.model {
    initNodeData(data) {
      super.initNodeData(data);
      this.width = data.width;
      this.height = data.height;
      this.foldable = true;
      this.draggable = false;
      this.unfoldedBounds = { x1: 0, y1: 0, x2: 0, y2: 0 };
      this.foldedWidth = 175;
      this.foldedHeight = 40;
      lf.graphModel.addNodeMoveRules((model, deltax, deltaY) => {
        return this.getMoveRules(model, deltax, deltaY);
      });
    }

    updateText(value) {
      const textValue = value.replace(/\n/gm, '');
      super.updateText(textValue.slice(0, 10));
    }

    getNodeStyle() {
      const style = super.getNodeStyle();
      style.stroke = '#0998FF';
      style.strokeWidth = 1;
      style.strokeDasharray = '3 3';
      style.fill = 'rgba(239,245,255,0.45)';
      return style;
    }

    getTextStyle() {
      const style = super.getTextStyle();
      style.fontSize = 14;
      style.color = '#3C96FE';
      style.fontWeight = 600;
      style.lineHeight = 16;
      return style;
    }

    getMoveRules() {
      return true;
    }

    foldGroup(isFolded) {
      const { x1, y1, x2, y2 } = this.getBounds();
      super.foldGroup(isFolded);
      if (isFolded) {
        this.unfoldedBounds = { x1, y1, x2, y2 };
        this.getMoveRules = this.moveRestrict;
        this.text = { ...this.foldedText };
        if (!this.text.value) {
          this.text.value = '已折叠分组';
        }
        this.text.x = this.x + 10;
        this.text.y = this.y;
      } else {
        this.unfoldedBounds = { x1: 0, y1: 0, x2: 0, y2: 0 };
        this.getMoveRules = () => {
          return true;
        };
        this.foldedText = { ...this.text };
        this.text = {};
      }
    }

    deleteGroup() {
      lf.deleteNode(this.id);
    }

    isPointInRange({ x, y }, { x1, y1, x2, y2 }) {
      if (x > x1 && x < x2 && y > y1 && y < y2) {
        return true;
      }
      return false;
    }

    // 限制节点移入被折叠的分组节点范围内
    moveRestrict(model, deltaX, deltaY) {
      const { x1, y1, x2, y2 } = this.unfoldedBounds;
      const modelBounds = model.getBounds();
      const minX = modelBounds.x1 + deltaX;
      const minY = modelBounds.y1 + deltaY;
      const maxX = modelBounds.x2 + deltaX;
      const maxY = modelBounds.y2 + deltaY;
      return !this.isPointInRange({ x: minX, y: minY }, { x1, y1, x2, y2 }) &&
          !this.isPointInRange({ x: maxX, y: minY }, { x1, y1, x2, y2 }) &&
          !this.isPointInRange({ x: maxX, y: maxY }, { x1, y1, x2, y2 }) &&
          !this.isPointInRange({ x: minX, y: maxY }, { x1, y1, x2, y2 });
    }
  }
  class IvrGroupView extends GroupNode.view {
    getFoldIcon() {
      const { model } = this.props;
      const foldX = model.x - model.width / 2 + 5;
      const foldY = model.y - model.height / 2 + 5;
      if (!model.foldable) return null;
      // 展开的icon
      const unFoldIcon =
        h('svg', {
          transform: 'translate(329.000000, 311.000000)',
          x: foldX,
          y: foldY,
          width: 20,
          height: 20,
          fill: '#3C96FE',
        },
        [
          h('path', {
            'pointer-events': 'none',
            d: 'M10.5097656,8.61914062 L16.8066406,2.32226563 C16.8554688,2.2734375 16.8203125,2.18945313 16.7519531,2.18945313 L13.6035156,2.18945313 C13.2636719,2.18945313 12.9746094,1.921875 12.9648438,1.58203125 C12.9550781,1.22851563 13.2382813,0.939453125 13.5898438,0.939453125 L18.4492188,0.939453125 C18.7949219,0.939453125 19.0742188,1.21875 19.0742188,1.56445313 L19.0742188,6.41015625 C19.0742188,6.75 18.8066406,7.0390625 18.4667969,7.04882813 C18.1132813,7.05859375 17.8242188,6.77539063 17.8242188,6.42382813 L17.8242188,3.25976563 C17.8242188,3.18945313 17.7402344,3.15625 17.6914063,3.20507813 L11.3925781,9.50195312 C11.1484375,9.74609375 10.7519531,9.74609375 10.5078125,9.50195312 C10.265625,9.2578125 10.265625,8.86328125 10.5097656,8.61914062 Z M0.921875,18.4375 L0.921875,13.5917969 C0.921875,13.2519531 1.18945312,12.9628906 1.52929688,12.953125 C1.8828125,12.9433594 2.171875,13.2265625 2.171875,13.578125 L2.171875,16.7402344 C2.171875,16.8105469 2.25585938,16.84375 2.3046875,16.7949219 L8.6015625,10.4980469 C8.72460938,10.375 8.8828125,10.3144531 9.04296875,10.3144531 C9.203125,10.3144531 9.36328125,10.375 9.484375,10.4980469 C9.72851562,10.7421875 9.72851562,11.1386719 9.484375,11.3828125 L3.18945312,17.6796875 C3.140625,17.7285156 3.17578125,17.8125 3.24414063,17.8125 L6.39257812,17.8125 C6.73242187,17.8125 7.02148438,18.0800781 7.03125,18.4199219 C7.04101562,18.7734375 6.7578125,19.0625 6.40625,19.0625 L1.546875,19.0625 C1.20117188,19.0625 0.921875,18.7832031 0.921875,18.4375 Z M1.25,6.875 L0,6.875 L0,0 L6.875,0 L6.875,1.25 L1.25,1.25 L1.25,6.875 Z M20,20 L13.125,20 L13.125,18.75 L18.75,18.75 L18.75,13.125 L20,13.125 L20,20 Z',
          }),
        ],
        );

      // 收起的icon
      const foldIcon =
        h('svg', {
          transform: 'translate(330.000000, 495.000000)',
          x: foldX,
          y: foldY,
          width: 20,
          height: 20,
          fill: '#3C96FE',
        },
        [
          h('path', {
            'pointer-events': 'none',
            d: 'M18.890625,2.00390625 L12.59375,8.30273438 C12.5449219,8.3515625 12.5800781,8.43554688 12.6484375,8.43554688 L15.796875,8.43554688 C16.1367187,8.43554688 16.4257812,8.703125 16.4355469,9.04296875 C16.4453125,9.39648438 16.1621094,9.68554688 15.8105469,9.68554688 L10.9511719,9.68554688 C10.6054687,9.68554688 10.3261719,9.40625 10.3261719,9.06054688 L10.3261719,4.21484375 C10.3261719,3.875 10.59375,3.5859375 10.9335938,3.57617188 C11.2871094,3.56640625 11.5761719,3.84960938 11.5761719,4.20117188 L11.5761719,7.36328125 C11.5761719,7.43359375 11.6601562,7.46679688 11.7089844,7.41796875 L18.0078125,1.12109375 C18.2519531,0.876953125 18.6484375,0.876953125 18.8925781,1.12109375 C19.1347656,1.36523438 19.1347656,1.75976562 18.890625,2.00390625 L18.890625,2.00390625 Z M9.66992188,10.9394531 L9.66992188,15.7851562 C9.66992188,16.125 9.40234375,16.4140625 9.0625,16.4238281 C8.70898438,16.4335938 8.41992188,16.1503906 8.41992188,15.7988281 L8.41992188,12.6367188 C8.41992188,12.5664062 8.3359375,12.5332031 8.28710938,12.5820312 L1.98828125,18.8789062 C1.86523438,19.0019531 1.70703125,19.0625 1.546875,19.0625 C1.38671875,19.0625 1.2265625,19.0019531 1.10546875,18.8789062 C0.861328125,18.6347656 0.861328125,18.2382812 1.10546875,17.9941406 L7.40234375,11.6972656 C7.45117188,11.6484375 7.41601563,11.5644531 7.34765625,11.5644531 L4.19921875,11.5644531 C3.859375,11.5644531 3.5703125,11.296875 3.56054688,10.9570312 C3.55078125,10.6035156 3.83398438,10.3144531 4.18554688,10.3144531 L9.04492188,10.3144531 C9.390625,10.3144531 9.66992188,10.59375 9.66992188,10.9394531 Z M1.25,6.875 L0,6.875 L0,0 L6.875,0 L6.875,1.25 L1.25,1.25 L1.25,6.875 Z M20,20 L13.125,20 L13.125,18.75 L18.75,18.75 L18.75,13.125 L20,13.125 L20,20 Z',
          }),
        ],
        );
      return h('g',
        {},
        [
          h('rect', {
            height: 20,
            width: 20,
            rx: 2,
            ry: 2,
            strokeWidth: 1,
            fill: 'transparent',
            stroke: 'transparent',
            cursor: 'pointer',
            x: model.x - model.width / 2 + 5,
            y: model.y - model.height / 2 + 5,
            onClick: () => {
              model.foldGroup(!model.properties.isFolded);
            },
          }),
          model.properties.isFolded ? unFoldIcon : foldIcon,

        ]);
    }

    getDeleteIcon() {
      const { model } = this.props;

      return h('g',
        {},
        [
          h('rect', {
            height: 20,
            width: 20,
            rx: 2,
            ry: 2,
            strokeWidth: 1,
            fill: 'transparent',
            stroke: 'transparent',
            cursor: 'pointer',
            x: model.x + model.width / 2 + 14,
            y: model.y - model.height / 2 + 5,
            onClick: () => {
              model.deleteGroup();
            },
          }),
          h('svg', {
            transform: 'translate(1.000000, 1.000000)',
            fill: '#3C96FE',
            x: model.x + model.width / 2 + 14,
            y: model.y - model.height / 2 + 5,
            width: 20,
            height: 20,
          },
          [
            h('path', {
              'pointer-events': 'none',
              d: 'M15.3,1.4 L12.6,1.4 L12.6,0 L5.4,0 L5.4,1.4 L0,1.4 L0,2.8 L2,2.8 L2,17.3 C2,17.6865993 2.31340068,18 2.7,18 L15.3,18 C15.6865993,18 16,17.6865993 16,17.3 L16,2.8 L18,2.8 L18,1.4 L15.3,1.4 Z M14.6,16.6 L3.4,16.6 L3.4,2.8 L14.6,2.8 L14.6,16.6 Z',
            }),
            h('path', {
              'pointer-events': 'none',
              d: 'M6,5.4 L7.4,5.4 L7.4,14.4 L6,14.4 L6,5.4 Z M10.6,5.4 L12,5.4 L12,14.4 L10.6,14.4 L10.6,5.4 Z',
            }),
          ]),
        ]);
    }

    getResizeShape() {
      return h('g', {}, [
        super.getResizeShape(),
        this.getDeleteIcon(),
      ]);
    }
  }
  lf.register({
    type: 'ivrGroupNode',
    view: IvrGroupView,
    model: IvrGroupModel,
  });
}
