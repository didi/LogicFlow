class ResizableHtmlModel extends HtmlResize.model {
  initNodeData(data) {
    super.initNodeData(data)
    this.width = 200;
    this.height = 100;
    this.text.draggable = true;
  }
  getNodeStyle() {
    const style = super.getNodeStyle();
    style.fill = "#f1a131";
    style.strokeWidth = 1;
    return style;
  }
}
class ResizableHtmlView extends HtmlResize.view {
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

export default {
  type: "resizable-html",
  view: ResizableHtmlView,
  model: ResizableHtmlModel
};
