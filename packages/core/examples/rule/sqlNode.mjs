// import { HtmlNode, HtmlNodeModel } from "@logicflow/core";

class SqlNode extends HtmlNode {
  setHtml(rootEl) {
    rootEl.innerHTML = "";
    const {
      properties: { fields, tableName }
    } = this.props.model;
    rootEl.setAttribute("class", "table-container");
    const container = document.createElement("div");
    container.className = `table-node table-color-${Math.ceil(
      Math.random() * 4
    )}`;
    const tableNameElement = document.createElement("div");
    tableNameElement.innerText = tableName;
    tableNameElement.className = "table-name";
    container.appendChild(tableNameElement);
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < fields.length; i++) {
      const item = fields[i];
      const itemElement = document.createElement("div");
      itemElement.className = "table-feild";
      const itemKey = document.createElement("span");
      itemKey.innerText = item.key;
      const itemType = document.createElement("span");
      itemType.innerText = item.type;
      itemType.className = "feild-type";
      itemElement.appendChild(itemKey);
      itemElement.appendChild(itemType);
      fragment.appendChild(itemElement);
    }
    container.appendChild(fragment);
    rootEl.appendChild(container);
  }
}

class SqlNodeModel extends HtmlNodeModel {
  /**
   * 给model自定义添加字段方法
   */
  addField(item) {
    this.properties.fields.push(item);
    this.setAttributes();
    // 为了保持节点顶部位置不变，在节点变化后，对节点进行一个位移,位移距离为添加高度的一半。
    this.move(0, 24 / 2);
  }
  getOutlineStyle() {
    const style = super.getOutlineStyle();
    style.stroke = "none";
    style.hover.stroke = "none";
    return style;
  }
  getAnchorStyle(anchorInfo) {
    const style = super.getAnchorStyle(anchorInfo);
    if (anchorInfo.type === 'left') {
      style.fill = 'red'
      style.hover.fill = 'transparent'
      style.hover.stroke = 'transpanrent'
      style.className = 'lf-hide-default'
    } else {
      style.fill = 'green'
    }
    return style;
  }
  setAttributes() {
    this.width = 200;
    const {
      properties: { fields }
    } = this;
    this.height = 60 + fields.length * 24;
    const circleOnlyAsTarget = {
      message: "只允许从右边的锚点连出",
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return sourceAnchor.type === "right";
      }
    };
    this.sourceRules.push(circleOnlyAsTarget);
    this.targetRules.push({
      message: "只允许连接左边的锚点",
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return targetAnchor.type === "left";
      }
    })
  }
  getDefaultAnchor() {
    const {
      id,
      x,
      y,
      width,
      height,
      properties: { fields }
    } = this;
    const anchors = [];
    fields.forEach((feild, index) => {
      anchors.push({
        x: x - width / 2 + 10,
        y: y - height / 2 + 60 + index * 24,
        id: `${id}_${index}_left`,
        edgeAddable: false,
        type: "left"
      });
      anchors.push({
        x: x + width / 2 - 10,
        y: y - height / 2 + 60 + index * 24,
        id: `${id}_${index}_right`,
        type: "right"
      });
    });
    return anchors;
  }
}

export default {
  type: "sql-node",
  model: SqlNodeModel,
  view: SqlNode
};
