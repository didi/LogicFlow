/**
 * 基于DynamicGroup重新实现的泳道节点组件
 * 继承DynamicGroupNodeModel和DynamicGroupNode，提供泳道特定功能
 */
import { h } from '@logicflow/core'
import { DynamicGroupNode } from '../dynamic-group'
import { laneConfig } from './constant'
import { LaneModel } from './LaneModel'

export class LaneView extends DynamicGroupNode {
  resetZIndex() {
    const { model } = this.props
    model.setZIndex()
  }
  getAppendAreaShape(): h.JSX.Element | null {
    // DONE: 此区域用于初始化 group container, 即元素拖拽进入感应区域
    const { model } = this.props
    const { width, height, x, y, radius, groupAddable } = model
    if (!groupAddable) return null

    const { strokeWidth = 0 } = model.getNodeStyle()
    const style = model.getAddableOutlineStyle()

    const newWidth = width + strokeWidth + 8
    const newHeight = height + strokeWidth + 8
    return h('rect', {
      ...style,
      width: newWidth,
      height: newHeight,
      x: x - newWidth / 2,
      y: y - newHeight / 2,
      rx: radius,
      ry: radius,
    })
  }
  getShape() {
    const { model } = this.props
    const {
      x,
      y,
      width,
      height,
      isHorizontal,
      properties: { textStyle: customTextStyle = {} },
    } = model
    const style = model.getNodeStyle()
    const base = { fill: '#ffffff', stroke: '#000000', strokeWidth: 1 }
    const left = x - width / 2
    const top = y - height / 2
    // 泳道主体
    const rectAttrs = {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke: '#000000',
      strokeWidth: 2,
      fill: 'transparent',
      ...style,
    }
    // 操作图标区域
    const icons = this.getOperateIcons()
    const titleRect = {
      ...base,
      ...style,
      x: isHorizontal ? left + laneConfig.titleSize : left,
      y: isHorizontal ? top : top + laneConfig.titleSize,
      width: isHorizontal ? width - laneConfig.titleSize : width,
      height: isHorizontal ? height : laneConfig.titleSize,
      ...(isHorizontal ? customTextStyle : {}),
    }
    return h('g', {}, [
      this.getAppendAreaShape(),
      h('rect', titleRect),
      h('rect', { ...rectAttrs }),
      ...icons,
    ])
  }

  /**
   * 获取操作图标
   */
  getOperateIcons() {
    const { model } = this.props
    const { isSelected } = model
    if (!isSelected) {
      return []
    }

    const poolModel = (model as LaneModel).getPoolModel()
    if (!poolModel) {
      return []
    }

    const { isHorizontal } = poolModel
    const laneData = model.getData()

    return [
      this.addBeforeLaneIcon(isHorizontal, () =>
        isHorizontal
          ? poolModel.addChildAbove?.(laneData)
          : poolModel.addChildLeft?.(laneData),
      ),
      this.addAfterLaneIcon(isHorizontal, () =>
        isHorizontal
          ? poolModel.addChildBelow?.(laneData)
          : poolModel.addChildRight?.(laneData),
      ),
      this.deleteLaneIcon(() => poolModel.removeChild?.(laneData)),
    ]
  }

  addBeforeLaneIcon(isHorizontal: boolean, callback: () => void) {
    const { x, y, width, height } = this.props.model
    // 图标与泳道之间加固定的间距
    const positionX = x + width / 2 + laneConfig.iconSpacing
    const positionY = y - height / 2
    const baseAttr = {
      width: laneConfig.iconSize / 2,
      height: laneConfig.iconSize,
      strokeWidth: 1,
      fill: '#fff',
      stroke: '#000',
      x: positionX,
      y: positionY,
    }
    let iconView: h.JSX.Element[] = [
      h('rect', {
        ...baseAttr,
        x: positionX + laneConfig.iconSize / 2,
        strokeDasharray: '2 2',
      }),
      h('rect', baseAttr),
    ]
    if (isHorizontal) {
      iconView = [
        h('rect', {
          ...baseAttr,
          width: laneConfig.iconSize,
          height: laneConfig.iconSize / 2,
          strokeDasharray: '2 2',
        }),
        h('rect', {
          ...baseAttr,
          width: laneConfig.iconSize,
          height: laneConfig.iconSize / 2,
          y: positionY + laneConfig.iconSize / 2,
        }),
      ]
    }
    return h('g', { cursor: 'pointer', onClick: callback }, iconView)
  }
  addAfterLaneIcon(isHorizontal: boolean, callback: () => void) {
    const { x, y, width, height } = this.props.model
    const positionX = x + width / 2 + laneConfig.iconSpacing
    const positionY =
      y - height / 2 + laneConfig.iconSize + laneConfig.iconSpacing
    const baseAttr = {
      width: laneConfig.iconSize / 2,
      height: laneConfig.iconSize,
      strokeWidth: 1,
      fill: '#fff',
      stroke: '#000',
      x: positionX,
      y: positionY,
    }
    let iconView: h.JSX.Element[] = [
      h('rect', {
        ...baseAttr,
        x: positionX + laneConfig.iconSize / 2,
      }),
      h('rect', {
        ...baseAttr,
        strokeDasharray: '2 2',
      }),
    ]
    if (isHorizontal) {
      iconView = [
        h('rect', {
          ...baseAttr,
          width: laneConfig.iconSize,
          height: laneConfig.iconSize / 2,
        }),
        h('rect', {
          ...baseAttr,
          width: laneConfig.iconSize,
          height: laneConfig.iconSize / 2,
          y: positionY + laneConfig.iconSize / 2,
          strokeDasharray: '2 2',
        }),
      ]
    }
    return h('g', { cursor: 'pointer', onClick: callback }, iconView)
  }
  deleteLaneIcon(callback: () => void) {
    const { x, y, width, height } = this.props.model
    const positionX = x + width / 2 + laneConfig.iconSpacing
    const positionY =
      y - height / 2 + (laneConfig.iconSize + laneConfig.iconSpacing) * 3
    return h(
      'g',
      {
        cursor: 'pointer',
        onClick: callback,
        width: laneConfig.iconSize,
        height: laneConfig.iconSize,
        transform: `translate(${positionX}, ${positionY})`,
      },
      [
        h('rect', {
          width: laneConfig.iconSize,
          height: laneConfig.iconSize,
          fill: 'transparent',
        }),
        h('path', {
          transform: `translate(2, 1) scale(${laneConfig.iconSize / 18})`,
          fill: '#000',
          d: 'M1.6361705,0.07275847000000002L1.6362224,0.07267305000000002L5.1435161,2.2034403L6.3516493,1.28341734Q7.2009554,0.63665058,8.0902505,1.22722644L10.1215935,2.5762291Q11.006711,3.1640306,10.745867,4.1940317L10.4062386,5.5351257L13.625054,7.5778356L13.625001,7.5779204Q13.678322,7.6117587,13.721552,7.6577945Q13.764784,7.7038307,13.795207,7.7591715Q13.82563,7.8145118,13.841336,7.87568Q13.857041,7.9368477,13.857041,8Q13.85704,8.0492353,13.847435,8.0975251Q13.83783,8.145814900000001,13.818987,8.191302799999999Q13.800144,8.2367907,13.772791,8.2777286Q13.745438,8.318666499999999,13.710623,8.3534818Q13.675808,8.3882966,13.63487,8.4156504Q13.593931,8.4430046,13.548444,8.461846399999999Q13.502956,8.4806881,13.454666,8.4902935Q13.406377,8.4998994,13.357141,8.499899899999999Q13.211908,8.499899899999999,13.089283,8.4220805L13.08923,8.4221654L4.9074116,3.229857L1.1170242400000001,0.92732695L1.1170761599999999,0.92724147Q1.06204063,0.8938076500000001,1.0172748,0.84751782Q0.97250897,0.80122799,0.9409355500000001,0.74510445Q0.9093622,0.68898091,0.89304277,0.626688Q0.87672335,0.564395107,0.87672332,0.5Q0.8767232899999999,0.450764146,0.88632876,0.402474351Q0.8959341599999999,0.35418455,0.91477591,0.30869657Q0.93361765,0.26320857,0.9609716500000001,0.22227046Q0.9883256,0.18133234999999998,1.02314061,0.14651734Q1.05795562,0.11170232000000002,1.0988937,0.08434838Q1.13983184,0.056994409999999995,1.18531984,0.038152660000000005Q1.2308077800000001,0.019310890000000025,1.27909762,0.009705450000000004Q1.32738745,0.00010001999999997846,1.3766233300000001,0.00009998999999999425Q1.516567,0.00009998999999999425,1.6361705,0.07275847000000002ZM9.5175018,4.9711194L9.7764683,3.9485345Q9.8634167,3.6052005,9.5683784,3.4092672L7.537035,2.0602646Q7.240603,1.8634058,6.9575009,2.0789949L6.0496349,2.7703574L9.5175018,4.9711194ZM11.227273,14.5L11.227273,9.7307692L11.227173,9.7307692Q11.227173,9.6815329,11.217567,9.6332426Q11.207962,9.5849533,11.189119,9.539465Q11.170278,9.4939766,11.142924,9.4530392Q11.11557,9.4121017,11.080755,9.3772869Q11.04594,9.3424721,11.005002,9.3151178Q10.964064,9.2877636,10.918575,9.2689209Q10.873087,9.2500801,10.824797,9.2404747Q10.776508,9.2308693,10.727273,9.2308693Q10.678036,9.2308693,10.629745,9.2404747Q10.581455,9.2500801,10.535968,9.2689209Q10.4904804,9.2877636,10.449542,9.3151178Q10.4086046,9.3424721,10.3737898,9.377286Q10.338975,9.4121008,10.3116207,9.4530382Q10.2842674,9.4939766,10.2654257,9.539465Q10.2465839,9.5849533,10.2369785,9.6332426Q10.2273731,9.6815329,10.2273731,9.7307692L10.2272739,9.7307692L10.2272739,14.5Q10.2272739,15,9.727273,15L7.7207794,15L7.7207789,8.2500091L7.7206788,8.2500091Q7.7206783,8.2007728,7.7110729,8.152483Q7.7014675,8.104193200000001,7.6826253,8.0587053Q7.6637836,8.013217000000001,7.6364298,7.9722791Q7.6090755,7.9313412,7.5742612,7.8965263Q7.5394459,7.861711,7.4985075,7.8343568Q7.4575696,7.807003,7.4120817,7.7881613Q7.3665934,7.7693195,7.3183041,7.7597141Q7.2700143,7.7501092,7.2207789,7.7501092Q7.1715426,7.7501092,7.1232524,7.7597141Q7.0749626,7.7693195,7.0294747,7.7881613Q6.9839869,7.807003,6.943049,7.8343573Q6.9021111,7.861711,6.8672962,7.8965263Q6.8324809,7.9313412,6.8051271,7.9722791Q6.7777729,8.013217000000001,6.7589312,8.0587053Q6.7400894,8.1041937,6.7304845,8.1524839Q6.7208786,8.2007732,6.7208791,8.2500095L6.7207789,8.2500091L6.7207794,15L4.2142854,15L4.2142854,6.2692308L4.2141855,6.2692308Q4.2141852,6.2199945,4.204579799999999,6.1717048Q4.1949743999999995,6.123415,4.1761324,6.0779266Q4.1572905,6.0324383,4.1299367,5.9915004Q4.1025827,5.9505625,4.0677679,5.9157476Q4.0329528,5.8809328,3.9920146,5.8535786Q3.9510765,5.8262248,3.9055884,5.8073831Q3.8601003,5.7885418,3.811811,5.7789364Q3.7635212,5.769331,3.7142854,5.769331Q3.6650493,5.769331,3.6167595,5.7789364Q3.5684695,5.7885418,3.5229816,5.8073831Q3.4774938,5.8262248,3.4365554,5.8535786Q3.3956175,5.8809328,3.3608027,5.9157476Q3.3259873,5.9505625,3.2986333,5.9915004Q3.2712793,6.0324383,3.2524376,6.0779266Q3.2335958,6.123415,3.2239904,6.1717048Q3.214385,6.2199945,3.2143853,6.2692308L3.2142854,6.2692308L3.2142854,15L1.5000002,15Q1.0000001200000002,15,1.0000001200000002,14.5L1,5.4150848Q1,5.0384622,1.3766233300000001,5.0384622L1.3766233300000001,5.0383615Q1.42585915,5.0383615,1.47414887,5.0287557Q1.5224386,5.0191503,1.5679266,5.0003085Q1.6134146,4.9814663,1.6543528,4.954113Q1.695291,4.9267588,1.730106,4.8919439Q1.7649209,4.8571291,1.792275,4.8161907Q1.8196288,4.7752523,1.8384706,4.7297645Q1.8573124,4.6842766,1.8669178,4.6359868Q1.8765233,4.587697,1.8765234,4.5384617Q1.8765233,4.4892254000000005,1.8669178,4.4409355999999995Q1.8573124,4.3926458,1.8384707,4.3471577Q1.819629,4.3016696,1.792275,4.2607315Q1.7649209,4.2197936,1.730106,4.1849787Q1.695291,4.1501637,1.6543529,4.1228096Q1.6134148,4.0954556,1.5679268,4.0766139Q1.5224388,4.0577724,1.4741489300000001,4.048166999999999Q1.42585915,4.0385615999999995,1.3766233300000001,4.0385615999999995L1.3766233300000001,4.0384617Q0.8064074800000001,4.0384617,0.403203636,4.4416654Q0,4.8448691,0,5.4150848L9.000000000813912e-8,14.5Q2.9999999984209325e-8,15.121321,0.439339694,15.56066Q0.8786805,16.000002000000002,1.5000002,16.000002000000002L9.727273,16.000002000000002Q10.3485928,16.000002000000002,10.787933,15.56066Q11.227273,15.121321,11.227273,14.5Z',
        }),
      ],
    )
  }

  createIcon(
    type: 'above' | 'below' | 'delete',
    x: number,
    y: number,
    width: number,
    height: number,
    poolModel: any,
    direction: string,
  ) {
    const rightX = x + width / 2 + laneConfig.iconSpacing
    const leftX = x - width / 2
    const topY = y - height / 2
    const laneData = this.props.model.getData()
    if (type === 'above') {
      const onClick =
        direction === 'horizontal'
          ? () => poolModel.addChildAbove?.(laneData)
          : () => poolModel.addChildLeft?.(laneData)
      const rects =
        direction === 'horizontal'
          ? [
              h('rect', {
                height: laneConfig.iconSize / 2,
                width: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: rightX,
                y: topY,
              }),
              h('rect', {
                height: laneConfig.iconSize / 2,
                width: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: rightX,
                y: topY + laneConfig.iconSize / 2,
              }),
            ]
          : [
              h('rect', {
                width: laneConfig.iconSize / 2,
                height: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: leftX + 3,
                y: topY + laneConfig.iconSpacing,
              }),
              h('rect', {
                width: laneConfig.iconSize / 2,
                height: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: leftX + 10,
                y: topY + laneConfig.iconSpacing,
              }),
            ]
      return h('g', { cursor: 'pointer', onClick }, rects)
    }
    if (type === 'below') {
      const onClick =
        direction === 'horizontal'
          ? () => poolModel.addChildBelow?.(laneData)
          : () => poolModel.addChildRight?.(laneData)
      const rects =
        direction === 'horizontal'
          ? [
              h('rect', {
                height: laneConfig.iconSize / 2,
                width: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: rightX,
                y: topY,
              }),
              h('rect', {
                height: laneConfig.iconSize / 2,
                width: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: rightX,
                y: topY + laneConfig.iconSize / 2,
              }),
            ]
          : [
              h('rect', {
                width: laneConfig.iconSize / 2,
                height: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                strokeDasharray: '2 2',
                x: x + width / 2 - 10,
                y: topY,
              }),
              h('rect', {
                width: laneConfig.iconSize / 2,
                height: laneConfig.iconSize,
                strokeWidth: 1,
                fill: '#fff',
                stroke: '#000',
                x: x + width / 2 - 20,
                y: topY,
              }),
            ]
      return h('g', { cursor: 'pointer', onClick }, rects)
    }
    const onClick = () => poolModel.deleteChild?.(this.props.model.id)
    const rect =
      direction === 'horizontal'
        ? h('rect', {
            width: 10,
            height: 10,
            strokeWidth: 1,
            fill: '#fff',
            stroke: '#000',
            x: x + width / 2 + 5,
            y: y + height / 2 - 15,
          })
        : h('rect', {
            width: 10,
            height: 10,
            strokeWidth: 1,
            fill: '#fff',
            stroke: '#000',
            x: x + width / 2 - 15,
            y: topY + 5,
          })
    const cross =
      direction === 'horizontal'
        ? h('path', {
            d: 'M 3 3 L 7 7 M 7 3 L 3 7',
            stroke: '#000',
            strokeWidth: 1,
            transform: `translate(${x + width / 2 + 10}, ${y + height / 2 - 10})`,
          })
        : h('path', {
            d: 'M 3 3 L 7 7 M 7 3 L 3 7',
            stroke: '#000',
            strokeWidth: 1,
            transform: `translate(${x + width / 2 - 10}, ${topY + 10})`,
          })
    return h('g', { cursor: 'pointer', onClick }, [rect, cross])
  }
}

export default null
