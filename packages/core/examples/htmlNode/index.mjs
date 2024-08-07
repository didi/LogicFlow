import customNode from "./customNode.mjs";
import sqlNode from "./sqlNode.mjs";

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  adjustEdgeStartAndEnd: true,
  width: 1000,
  grid: true,
  height: 400,
  // hoverOutline: false
})

lf.register(customNode);
lf.register(sqlNode);

lf.render({
  nodes: [
    {
      id: 'custom-111',
      type: 'button-node',
      x: 700,
      y: 100,
      properties: {
        name: 'hello',
        body: 'world'
      }
    },
    {
      id: 'custom-112',
      type: 'button-node',
      x: 700,
      y: 300,
      properties: {
        name: 'hello',
        body: 'world'
      }
    },
    {
      id: "node_id_1",
      type: "sql-node",
      x: 100,
      y: 100,
      properties: {
        tableName: "Users",
        fields: [
          {
            key: "id",
            type: "string"
          },
          {
            key: "name",
            type: "string"
          },
          {
            key: "age",
            type: "integer"
          }
        ]
      }
    },
    {
      id: "node_id_2",
      type: "sql-node",
      x: 400,
      y: 200,
      properties: {
        tableName: "Settings",
        fields: [
          {
            key: "id",
            type: "string"
          },
          {
            key: "key",
            type: "integer"
          },
          {
            key: "value",
            type: "string"
          }
        ]
      }
    },
  ]
});

lf.on("custom:button-click", (model) => {
  lf.setProperties(model.id, {
    body: "LogicFlow"
  });
});

lf.on("anchor:dragstart", ({ data, nodeModel }) => {
  if (nodeModel.type === "sql-node") {
    lf.graphModel.nodes.forEach((node) => {
      if (node.type === "sql-node" && nodeModel.id !== node.id) {
        node.isShowAnchor = true;
        node.setProperties({
          isConnection: true
        });
      }
    });
  }
});
lf.on("anchor:dragend", ({ data, nodeModel }) => {
  if (nodeModel.type === "sql-node") {
    lf.graphModel.nodes.forEach((node) => {
      if (node.type === "sql-node" && nodeModel.id !== node.id) {
        node.isShowAnchor = false;
        lf.deleteProperty(node.id, 'isConnection');
      }
    });
  }
});

document.querySelector('#event-test').addEventListener('click', () => {
  console.log('click')
})
document.querySelector('#event-test-wrapper').addEventListener('mousedown', (ev) => {
  // console.log(ev)
  console.log('mousedown')
  ev.stopPropagation()
  ev.preventDefault()
})
document.querySelector('#event-test').addEventListener('mousedown', (ev) => {
  console.log('mousedown')
})
