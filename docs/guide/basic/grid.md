# 网格 Grid

> 网格是指渲染/移动节点的最小单位，网格在 DOM 层级中位于背景层之上，图形元素层之下。

网格默认关闭，渲染/移动最小单位为 1px，若开启网格，则网格默认大小为 20px，渲染节点时表示以 20 为最小单位对齐到网络，移动节点时表示每次移动最小距离为 20px。

> 在设置节点坐标时候会按照网格的大小来对坐标进行转换，如设置中心点位置`{ x: 124, y: 138 }` 的节点渲染到画布后的实际位置为 `{ x: 120, y: 140 }`

## 开启网格
在创建画布的时候通过配置 `grid` 来设置网格属性

开启网格并应用默认属性：
```js
const lf = new LogicFlow({
    grid: true
})

// 等同于默认属性如下
const lf = new LogicFlow({
    grid: {
      size: 20,
      visible: true,
      type: 'dot',
      config: {
        color: '#ababab',
        thickness: 1,
      },
    }
})
```

## 设置网格属性

支持设置网格大小、类型、网格线颜色和宽度等属性。

```js
export type GridOptions = {
  size?: number  // 设置网格大小
  visible?: boolean,  // 设置是否可见，若设置为false则不显示网格线但是仍然保留size栅格的效果
  type?: 'dot' | 'mesh', // 设置网格类型，目前支持 dot 点状和 mesh 线状两种
  config?: {
    color: string,  // 设置网格的颜色
    thickness?: number,  // 设置网格线的宽度
  }
};
```

## 示例

<example :height="280" ></example>