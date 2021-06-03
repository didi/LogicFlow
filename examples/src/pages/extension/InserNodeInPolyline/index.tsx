import React, { useEffect } from 'react';
import LogicFlow from '@logicflow/core';
import { InsertNodeInPolyline, DndPanel, SelectionSelect } from '@logicflow/extension';
import ExampleHeader from '../../../components/example-header';
import 'antd/lib/button/style/index.css';
import './index.css';

const config = {
    grid: {
        type: 'dot',
        size: 20,
    },
}

const data = {
    nodes: [
        {
            id: 10,
            type: 'rect',
            x: 150,
            y: 70,
            text: '矩形'
        },
        {
            id: 20,
            type: 'circle',
            x: 400,
            y: 70,
            text: '圆形'
        }
    ],
    edges: [
        {
            type: 'polyline',
            sourceNodeId: 10,
            targetNodeId: 20,
        }
    ]
};

const contentStyle = {
    display: 'flex',
    alignItems: 'center'
}

let lf: LogicFlow;

export default function SnapshotExample() {

    useEffect(() => {
        LogicFlow.use(InsertNodeInPolyline);
        LogicFlow.use(DndPanel);
        LogicFlow.use(SelectionSelect);
        lf = new LogicFlow({
            ...config,
            container: document.querySelector('#graph') as HTMLElement
        });
        lf.setPatternItems([
            {
                type: 'circle',
                text: '圆形',
                className: 'circle'
            },
            {
                type: 'rect',
                text: '矩形',
                className: 'rect'
            },
        ]);
        lf.render(data)
    }, []);

    return (
        <>
            <ExampleHeader contentStyle={contentStyle}>
                拖拽节点到线中间进行节点插入：
            </ExampleHeader>
            <div id="graph" className="viewport" />
        </>
    )
}

