# 节点 Node

LogicFlow 的内置节点包括

- 矩形(rect)
- 圆形(circle)
- 椭圆（ellipse)
- 菱形(diamond)
- 多边形(polygon)
- 文本(text)

## 通用属性

### 数据属性

> 作为data进行保存，可以通过lf.setNodeData进行修改  

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| id    | String |  ✅  | 节点 id|
| type | String | ✅ | 节点类型 |
| x | number | ✅ | 节点中心x轴坐标 |
| y | number | ✅ | 节点中心y轴坐标 |
| text | Object/String  |    | 节点文本 |
| properties | Object |    | 节点自定义属性 |

### 样式属性

> 属性取值内部已定义，不作为data进行保存，可通过修改主题、自定义节点方式进行属性值的修改  

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| width | number | ✅ | 节点宽度 |
| height| number | ✅ | 节点高度 |
| fill  | color  | ✅ | 节点填充颜色 |
| fillOpacity | number  | ✅ | 节点填充颜色透明度 |
| stroke | color  | ✅ | 节点边框颜色 |
| strokeOpacity | number  | ✅ | 节点边框颜色透明度 |
| strokeWidth | number  | ✅ | 节点边框宽度 |
| opacity | number  | ✅ | 节点整体透明度 |
| outlineColor | color  | ✅ | 外框颜色 |
| hoverOutlineColor | color  | ✅ | hover外边框颜色 |
| outlineStrokeDashArray | string  | ✅ | 控制用来描外边框的点划线的图案范式, 设置为空是为实线 |
| hoverOutlineStrokeDashArray | string  | ✅ | 控制用来描hover外边框的点划线的图案范式, 设置为空是为实线 |
  
### 附加属性

> 不对外输出  

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| modelType | String | ✅  | 节点图形类型，已内部定义 |
| graphModel | object | ✅  | 图形数据|
| menu | Object |    | 节点菜单 |
| anchorsOffset | Array |    | 锚点相对于节点中心坐标的偏移值数组 |
| targetRules | Array |    | 节点可以连接的规则 |
| sourceRules | Array |    | 节点可以被连接的规则 |
| additionStateData | object |    | 设置节点状态的附加数据，例如显示菜单，菜单的位置信息|

### 状态属性

> 编辑过程中使用，不对外输出

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| isSelected | boolean |  ✅ | 节点是否被选中        |
| isHovered  | boolean |  ✅ | 节点是否在hover状态       |
| zIndex     | number  |  ✅ | 节点在图中显示优先级，数值大的在上面，类似于css中zIndex的定义     |
| anchors    | Array  |  ✅ | 锚点数组 |
| state | number  |  ✅ | 节点状态|

节点状态

- 1：默认
- 2：文本编辑
- 3：展示菜单
- 4：允许连接
- 5：不允连接  

## 通用方法

### lf.addNode

创建节点

#### 参数

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| nodeConfig | NodeConfig| 节点数据 |

```ts
type NodeConfig = {
  id?: string;
  type: string;
  x: number;
  y: number;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

#### 返回值

无

#### 用法

``` ts
lf.addNode(nodeConfig: NodeConfig);
```

### lf.getNodeData

获取节点数据

#### 参数

| 名称 | 类型 | 描述 |
| :----- | :----- | :----- | :----- |
| nodeId | string | 节点Id |

#### 返回值

| 名称 | 类型 | 描述 |
| :----- | :----- | :----- | :----- |
| nodeData | NodeData | 节点数据 |

```ts
// 节点数据
type NodeData = {
  id: string;
  type: string;
  x: number;
  y: number;
  text: TextConfig;
  properties: Record<string, unknown>;
};
```

#### 用法

```ts
lf.getNodeData(nodeId);
```

### lf.setNodeData

设置节点数据(即将废弃，如果想要修改properties，请使用setProperties。如果想要修改id请使用setNodeId)

#### 参数

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| nodeAttribute | NodeAttribute | 节点数据 |

```ts
// 修改节点数据的参数
export type NodeAttribute = {
  id: string;
  type?: string;
  x?: number;
  y: number;
  text?: TextConfig;
  properties?: Record<string, unknown>;
};
```

#### 返回值

无

#### 用法

``` ts
lf.setNodeData(nodeData);
```

### lf.deleteNode

删除节点

#### 参数

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| nodeId | string | 节点Id |

#### 返回值

无

#### 用法

``` ts
lf.deleteNode(nodeId);
```

### lf.cloneNode

复制节点

#### 参数

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| nodeId | string | 节点Id |

#### 返回值

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| nodeData | NodeData | 节点数据 |

``` ts
// 节点数据
type NodeData = {
  id: string;
  type: string;
  x: number;
  y: number;
  text: TextConfig;
  properties: Record<string, unknown>;
};
```

#### 用法

``` ts
lf.cloneNode(nodeId);
```

### lf.focusOn

将节点定位到画布中心

#### 参数

| 名称   | 类型   | 必传 |默认值    | 描述         |
| :------ | :----- | :-------- |:-------- | :----------- |
| id  | String  |  | - |  图形的id   |
| coordinate  | Object  |   | - |  图形当前的位置坐标   |

#### 返回值

无

#### 用法

```js
lf.focusOn({
  id: '22'
})

lf.focusOn({
  coordinate: {
    x: 11,
    y: 22
  }
})
```

## 节点属性

> 不同类型节点自定义的属性，自定义属性都是样式属性，下面不再区分属性类型。属性取值内部已定义，不作为data进行保存，可通过修改主题、自定义节点方式进行属性值的修改。

### 矩形

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| radius | number | ✅ | 矩形圆角 |

### 圆形

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| r | number | ✅ | 圆形半径 |

### 椭圆

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| rx | number | ✅ | 椭圆x轴半径 |
| ry | number | ✅ | 椭圆y轴半径 |
### 菱形

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| rx | number | ✅ | 菱形x轴宽度的1/2 |
| ry | number | ✅ | 菱形y轴高度的1/2 |

### 多边形

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| points | Point[] | ✅ | 多边形端点坐标 |

```ts
type Point = [number, number]
```

### 文本

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| fontSize | number | ✅ | 字体大小 |
| fontFamily | string | ✅ | 字体类型 |
| fontWeight | number / string | ✅ | 字体粗细 |
