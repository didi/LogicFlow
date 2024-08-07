import cardLine from "./cardLine.js";
import htmlCard from "./htmlCard.js";

const lf = new LogicFlow({
  container: document.querySelector('#container'),
  grid: true,
});

lf.register(cardLine);
lf.register(htmlCard);
lf.setDefaultEdgeType('card-line');
lf.render({
  nodes: [
    {
      id: '1',
      type: 'html-card',
      x: 300,
      y: 100,
      properties: {
        title: '普通话术',
        content: '喂，您好，这里是美家装饰，专业的装修品牌。请问您最近有装修吗？',
        answers: [
          {
            id: '10',
            text: '装好了'
          },
          {
            id: '11',
            text: '肯定'
          },
          {
            id: '12',
            text: '拒绝'
          },
          {
            id: '13',
            text: '否定'
          },
          {
            id: '14',
            text: '默认'
          }
        ]
      }
    },
    {
      id: '2',
      type: 'html-card',
      x: 200,
      y: 300,
      properties: {
        title: '跳转话术',
        content: '好的，我们将给安排专门装修师傅上面服务。',
        answers: [
          {
            id: '21',
            text: '肯定'
          },
          {
            id: '23',
            text: '否定'
          }
        ]
      }
    },
    {
      id: '3',
      type: 'html-card',
      x: 600,
      y: 300,
      properties: {
        title: '普通话术',
        content: '好的，我们将给安排专门装修师傅上面服务。',
        answers: [
          {
            id: '31',
            text: '肯定'
          },
          {
            id: '43',
            text: '否定'
          }
        ]
      }
    }
  ],
  edges: [
    {
      "id":"36097b7b-f7fb-4eba-ac84-d9cec1e8f4d0",
      "type":"card-line",
      "sourceNodeId":"1",
      "targetNodeId":"2",
      "startPoint":{"x":249,"y":145},
      "endPoint":{"x":200,"y":250},
      "properties":{},
      "pointsList":[{"x":249,"y":145},{"x":249,"y":250},{"x":200,"y":150},{"x":200,"y":250}]
    },
    {
      "id":"ab537079-c6d9-45b9-8251-ebb5d7a98998",
      "type":"card-line",
      "sourceNodeId":"1",
      "targetNodeId":"3",
      "startPoint":{"x":325,"y":145},
      "endPoint":{"x":600,"y":250},
      "properties":{},
      "pointsList":[{"x":325,"y":145},{"x":325,"y":250},{"x":600,"y":150},{"x":600,"y":250}]
    }
  ]
});

document.querySelector('#getJson').addEventListener('click', () => {
  const data = lf.getGraphData();
  console.log(JSON.stringify(data));
})