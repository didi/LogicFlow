# editConfigModel

控制页面编辑状态

## 属性说明

|属性名|类型|默认值|说明|
|-|-|-|-|
|stopZoomGraph|boolean|false|禁止缩放画布|
|stopScrollGraph|boolean|false|禁止鼠标滚动移动画布|
|stopMoveGraph|boolean|false|禁止拖动画布|
|adjustEdge|boolean|true|允许调整连线|
|adjustNodePosition|boolean|true|允许拖动节点|
|hideAnchors|boolean|false|隐藏节点所有锚点|
|hoverOutline|boolean|false|鼠标hover的时候显示节点的外框|
|nodeTextEdit|boolean|true|允许节点文本可以编辑|
|edgeTextEdit|boolean|true|允许连线文本可以编辑|
|nodeTextDraggable|boolean|false|允许节点文本可以拖拽|
|edgeTextDraggable|boolean|false|允许连线文本可以拖拽|
|metaKeyMultipleSelected|boolean|false|允许按照meta键多选元素|


## updateEditConfig

`方法`

修改流程表编辑状态

入参:
|名称|类型|默认值|说明|
|-|-|-|-|
|config|object|无| 页面编辑状态配置 |

```ts
editConfig.updateEditConfig({
  stopZoomGraph: true
})
```

## getConfig

`方法`

获得当前页面编辑状态

```ts
editConfig.getConfig()
```