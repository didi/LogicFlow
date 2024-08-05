import { Divider, Tag } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Highlight } = Extension;

const config: Partial<LogicFlow.Options> = {
  edgeTextDraggable: true, // 允许边文本可拖拽
  nodeTextDraggable: true, // 允许节点文本可拖拽
  grid: {
    type: 'dot',
    size: 20,
  },
  plugins: [Highlight],
  snapline: true, // 是否开启辅助对齐线
  pluginsOptions: {
    // highlight: {
    //   mode: 'neighbour', // 取消注释后高亮模式会设置成相邻元素高亮
    //   // mode: 'single', // 取消注释后高亮模式会设置成仅当前高亮
    //   enable: false, // 取消注释后高亮插件会被禁用
    // },
  },
};

const data = {
  nodes: [
    {
      id: '841c075c-dc2c-4543-b3f2-433145f4aee8',
      type: 'circle',
      x: 200,
      y: 160,
      properties: {},
    },
    {
      id: '797f20d9-ae6c-4bfe-a73d-6c3636a369c7',
      type: 'circle',
      x: 460,
      y: 160,
      properties: {},
    },
    {
      id: '42046fdc-ce41-471f-908f-17b06b452b65',
      type: 'circle',
      x: 740,
      y: 160,
      properties: {},
    },
    {
      id: '6ffe7da6-f92d-49bf-8347-77ce9a916dae',
      type: 'circle',
      x: 1020,
      y: 160,
      properties: {},
    },
    {
      id: '1bff9d46-3adb-4b10-a4d3-d12e70b6ec17',
      type: 'circle',
      x: 200,
      y: 400,
      properties: {},
    },
    {
      id: '550725bf-a811-4d80-bec7-faf62f0d9e70',
      type: 'circle',
      x: 460,
      y: 400,
      properties: {},
    },
    {
      id: '70ef3ba6-e3ee-4d9d-8738-26dcfa279e31',
      type: 'circle',
      x: 740,
      y: 400,
      properties: {},
    },
    {
      id: '6b75b36e-c924-4fe0-a5a7-57f55c05aba2',
      type: 'circle',
      x: 1020,
      y: 400,
      properties: {},
    },
    {
      id: 'b310d34a-3486-45f8-bb28-68d3e72f8e87',
      type: 'circle',
      x: 200,
      y: 640,
      properties: {},
    },
    {
      id: 'c8cb9eae-8e4d-4dcc-8191-d74887f65ff6',
      type: 'circle',
      x: 460,
      y: 640,
      properties: {},
    },
    {
      id: 'e860348e-64cd-4744-b4ee-011bf4c2cea5',
      type: 'circle',
      x: 740,
      y: 640,
      properties: {},
    },
    {
      id: 'e0850863-0d87-4a40-99d1-986e423c8281',
      type: 'circle',
      x: 1020,
      y: 640,
      properties: {},
    },
  ],
  edges: [
    {
      id: '6d237f02-afa3-4120-8166-cc7553123659',
      type: 'polyline',
      sourceNodeId: '841c075c-dc2c-4543-b3f2-433145f4aee8',
      targetNodeId: '797f20d9-ae6c-4bfe-a73d-6c3636a369c7',
      startPoint: {
        x: 250,
        y: 160,
      },
      endPoint: {
        x: 410,
        y: 160,
      },
      properties: {},
      pointsList: [
        {
          x: 250,
          y: 160,
        },
        {
          x: 410,
          y: 160,
        },
      ],
    },
    {
      id: '4daae1f4-d889-45ce-b546-fcdfc6023298',
      type: 'polyline',
      sourceNodeId: '1bff9d46-3adb-4b10-a4d3-d12e70b6ec17',
      targetNodeId: '550725bf-a811-4d80-bec7-faf62f0d9e70',
      startPoint: {
        x: 250,
        y: 400,
      },
      endPoint: {
        x: 410,
        y: 400,
      },
      properties: {},
      pointsList: [
        {
          x: 250,
          y: 400,
        },
        {
          x: 410,
          y: 400,
        },
      ],
    },
    {
      id: '8c674004-eaa4-437e-a219-a8b6dc573542',
      type: 'polyline',
      sourceNodeId: '550725bf-a811-4d80-bec7-faf62f0d9e70',
      targetNodeId: '70ef3ba6-e3ee-4d9d-8738-26dcfa279e31',
      startPoint: {
        x: 510,
        y: 400,
      },
      endPoint: {
        x: 690,
        y: 400,
      },
      properties: {},
      pointsList: [
        {
          x: 510,
          y: 400,
        },
        {
          x: 690,
          y: 400,
        },
      ],
    },
    {
      id: 'cda7fc59-fa5a-455b-b613-81e1aa5ae9e3',
      type: 'polyline',
      sourceNodeId: '70ef3ba6-e3ee-4d9d-8738-26dcfa279e31',
      targetNodeId: '42046fdc-ce41-471f-908f-17b06b452b65',
      startPoint: {
        x: 740,
        y: 350,
      },
      endPoint: {
        x: 740,
        y: 210,
      },
      properties: {},
      pointsList: [
        {
          x: 740,
          y: 350,
        },
        {
          x: 740,
          y: 210,
        },
      ],
    },
    {
      id: '99ca4acb-e43b-4979-956c-15b5683cef9c',
      type: 'polyline',
      sourceNodeId: '42046fdc-ce41-471f-908f-17b06b452b65',
      targetNodeId: '6ffe7da6-f92d-49bf-8347-77ce9a916dae',
      startPoint: {
        x: 790,
        y: 160,
      },
      endPoint: {
        x: 970,
        y: 160,
      },
      properties: {},
      pointsList: [
        {
          x: 790,
          y: 160,
        },
        {
          x: 970,
          y: 160,
        },
      ],
    },
    {
      id: '2755073c-0f36-4b92-85fd-d4f3ba84d409',
      type: 'polyline',
      sourceNodeId: '70ef3ba6-e3ee-4d9d-8738-26dcfa279e31',
      targetNodeId: '6b75b36e-c924-4fe0-a5a7-57f55c05aba2',
      startPoint: {
        x: 790,
        y: 400,
      },
      endPoint: {
        x: 970,
        y: 400,
      },
      properties: {},
      pointsList: [
        {
          x: 790,
          y: 400,
        },
        {
          x: 970,
          y: 400,
        },
      ],
    },
    {
      id: 'e1971a8d-6dfa-48d8-9dff-e1297fadbf59',
      type: 'polyline',
      sourceNodeId: '70ef3ba6-e3ee-4d9d-8738-26dcfa279e31',
      targetNodeId: '1bff9d46-3adb-4b10-a4d3-d12e70b6ec17',
      startPoint: {
        x: 740,
        y: 450,
      },
      endPoint: {
        x: 200,
        y: 450,
      },
      properties: {},
      pointsList: [
        {
          x: 740,
          y: 450,
        },
        {
          x: 740,
          y: 480,
        },
        {
          x: 200,
          y: 480,
        },
        {
          x: 200,
          y: 450,
        },
      ],
    },
    {
      id: 'fca79c53-8af2-4373-86fe-ce84d0c43442',
      type: 'polyline',
      sourceNodeId: '6b75b36e-c924-4fe0-a5a7-57f55c05aba2',
      targetNodeId: 'e0850863-0d87-4a40-99d1-986e423c8281',
      startPoint: {
        x: 1020,
        y: 450,
      },
      endPoint: {
        x: 1020,
        y: 590,
      },
      properties: {},
      pointsList: [
        {
          x: 1020,
          y: 450,
        },
        {
          x: 1020,
          y: 590,
        },
      ],
    },
    {
      id: 'ad3d2536-2cbf-4b4d-9dec-69fd5dc6d11f',
      type: 'polyline',
      sourceNodeId: 'c8cb9eae-8e4d-4dcc-8191-d74887f65ff6',
      targetNodeId: 'e860348e-64cd-4744-b4ee-011bf4c2cea5',
      startPoint: {
        x: 510,
        y: 640,
      },
      endPoint: {
        x: 690,
        y: 640,
      },
      properties: {},
      pointsList: [
        {
          x: 510,
          y: 640,
        },
        {
          x: 690,
          y: 640,
        },
      ],
    },
    {
      id: '670e2f05-f7af-403f-8a29-6036225167bc',
      type: 'polyline',
      sourceNodeId: 'b310d34a-3486-45f8-bb28-68d3e72f8e87',
      targetNodeId: '1bff9d46-3adb-4b10-a4d3-d12e70b6ec17',
      startPoint: {
        x: 150,
        y: 640,
      },
      endPoint: {
        x: 150,
        y: 400,
      },
      properties: {},
      pointsList: [
        {
          x: 150,
          y: 640,
        },
        {
          x: 120,
          y: 640,
        },
        {
          x: 120,
          y: 400,
        },
        {
          x: 150,
          y: 400,
        },
      ],
    },
    {
      id: '9659fa39-80da-4321-b4b2-d609d2a543a3',
      type: 'polyline',
      sourceNodeId: '1bff9d46-3adb-4b10-a4d3-d12e70b6ec17',
      targetNodeId: '797f20d9-ae6c-4bfe-a73d-6c3636a369c7',
      startPoint: {
        x: 200,
        y: 350,
      },
      endPoint: {
        x: 460,
        y: 210,
      },
      properties: {},
      pointsList: [
        {
          x: 200,
          y: 350,
        },
        {
          x: 200,
          y: 240,
        },
        {
          x: 460,
          y: 240,
        },
        {
          x: 460,
          y: 210,
        },
      ],
    },
  ],
};

const container = document.querySelector('#container');
const root = createRoot(container);

const HighLightExtension: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lf: LogicFlow = new LogicFlow({
      container: containerRef.current!,
      ...config,
    });

    lf.render(data);
    lf.translateCenter();
  }, []);
  return (
    <>
      <p>
        鼠标{' '}
        <Tag color="processing" bordered={false}>
          hover
        </Tag>{' '}
        到节点或边上会高亮与这个节点或边相关的节点和边
      </p>
      <p>节点：高亮这个节点前后相关的所有边和节点</p>
      <p>边：高亮这个边指向的节点前后相关的所有边和节点</p>
      <Divider />
      <div ref={containerRef} id="graph"></div>
    </>
  );
};

root.render(<HighLightExtension></HighLightExtension>);

insertCss(`
#graph {
  height: calc(100% - 70px);
}
`);
