# 边 Edge

Logic Flow 的内置连线类型包括
- 直线(line)
- 直角折线(polyline)

## 通用属性

### 数据属性
> 作为data进行保存，可以通过lf.setEdgeData进行修改  

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| id    | String |  ✅  | 边 id|
| type | String | ✅ | 边类型 |
| sourceNodeId | string | ✅ | 开始节点Id |
| sourceNodeId | string | ✅ | 结束节点Id |
| startPoint | Point | ✅ | 边的开始坐标 |
| endPoint | Point | ✅ | 边的坐标 |
| text | Object/String  |    | 边文本 |
| properties | Object |    | 边的自定义属性 |

### 样式属性
> 属性取值内部已定义，不作为data进行保存，可通过修改主题、自定义边方式进行属性值的修改  

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| fill  | color | ✅ | 边填充颜色，取值为none |
| fillOpacity | number  | ✅ | 边填充颜色透明度，取值为0 |
| stroke | color | ✅ | 边颜色 |
| strokeOpacity | number  | ✅ | 边透明度 |
| strokeWidth | number  | ✅ | 边宽度 |
| hoverStroke | color  | ✅ | 边hover时的颜色 |
| selectedStroke | color  | ✅ | 边选中时的颜色 |
| selectedShadow | boolean  | ✅ | 边选中时的是否展示阴影 |

### 附加属性
> 不对外输出  
> 
| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| modelType | String | ✅  | 边图形类型，已内部定义 |
| graphModel | object | ✅  | 图形数据|
| additionStateData | object |    | 设置节点状态的附加数据，例如显示菜单，菜单的位置信息|

### 状态属性
> 编辑过程中使用不对外输出

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------ | :------------- |
| isSelected | boolean |  ✅ | 边是否被选中        |
| isHovered  | boolean |  ✅ | 边是否在hover状态       |
| zIndex     | number  |  ✅ | 边在图中显示优先级，数值大的在上面，类似于css中zIndex的定义 |

## 通用方法

### lf.createEdge

创建边

**参数**

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| edgeConifg | EdgeConifg| 创建边的配置数据 |
``` ts
export type EdgeConifg = {
  id?: string,
  type?: string,
  sourceNodeId: string,
  startPoint?: Point,
  targetNodeId: string,
  endPoint?: Point,
  text?: string | TextConfig,
  properties?: Record<string, unknown>;
};
```

**返回值**  

无

**用法**
```ts 
lf.createEdge(edgeConfig);
```

### lf.getEdgeData

获取边数据

**参数**

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| edgeId | string | 边Id |

**返回值**  

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| edgeData | EdgeData | 边数据 |

```ts
type EdgeData = {
  id: string,
  type: string,
  sourceNodeId: string,
  startPoint: Point,
  targetNodeId: string,
  endPoint: Point,
  text: TextConfig,
  properties: Record<string, unknown>;
  pointsList?: Point[], // 折线会输出pointsList
};
```
### lf.setEdgeData

修改边数据

**参数**

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| edgeData | EdgeAttribute | 修改边数据需要的参数 |

```ts
// 边属性
type EdgeAttribute = {
  id: string,
  type?: string,
  sourceNodeId?: string,
  startPoint?: Point,
  targetNodeId?: string,
  endPoint?: Point,
  text?: TextConfig,
  properties?: Record<string, unknown>;
};
```
**返回值** 

无

### lf.removeEdge

删除边

**参数**

| 名称   | 类型   | 描述            |
| :----- | :----- | :------- | :-------------- |
| edgeFilter | EdgeFilter | 删除边参数 |

```ts
type EdgeFilter = {
  id?: string,
  sourceNodeId?: string,
  targetNodeId?: string,
};
```
> 参数规则 
> - 存在id，删除指定id的边
> - 仅存在sourceNodeId，删除以sourceNodeId为开始节点的边
> - 仅存在targetNodeId，删除以targetNodeId为结束节点的边
> - 存在targetNodeId和targetNodeId，删除以sourceNodeId为开始节点，并且以targetNodeId为结束节点的边

**返回值** 

无


## 边属性
> 不同类型边自定义的属性

### 折线
#### 数据属性
  
  | 名称  | 类型   | 是否必须 | 描述           |
  | :---- | :----- | :------- | :------------- |
  | PointsList | PolyPoint[] | ✅ | 折线路线上的点坐标集合 |
  ```ts
   type PolyPoint = {
    x: number;
    y: number;
    id?: string;
  };
  ```
- 样式属性
  
  | 名称  | 类型   | 是否必须 | 描述           |
  | :---- | :----- | :------- | :------------- |
  | offset | number | ✅ | 起终点的相邻点距离起终点的距离 |

- 附加属性
  
  | 名称  | 类型   | 是否必须 | 描述           |
  | :---- | :----- | :------- | :------------- |
  | draginngPointList | PolyPoint[] | ✅ | 调整边的过程中，中间计算附加数据 |
  | points | string | ✅ | 边渲染依赖字段，初始化是与PointsList对应，调整时与draginngPointList对应 |


### 箭头
> 边在渲染不仅包含路径，还包含箭头部分，目前仅支持边的末尾渲染箭头。箭头的样式属性依赖边的样式属性，保持一致。箭头形状可以通过修改主题、自定义节点方式进行修改。

####  箭头属性

| 名称  | 类型   | 是否必须 | 描述           |
| :---- | :----- | :------- | :------------- |
| stroke | color| ✅ | 边的颜色 |
| fill | color | ✅ | 边的颜色 |
| strokeWidth | number | ✅ | 取值为1 |
| offset | number | ✅ | 箭头长度 |
| verticalLength | number | ✅ | 箭头垂直于连线的距离 |

