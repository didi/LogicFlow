import React, { ReactElement, CSSProperties } from 'react';
import { Tooltip, Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import './style.css';

const githubBaseLink = 'https://github.com/didi/LogicFlow/tree/master/examples/src/pages';

type IProps = {
  content?: string;
  children?: any;
  contentStyle?: CSSProperties;
  githubPath?: string;
};

export default function ExampleHeader(props: IProps): ReactElement {

  function getGithubTool() {
    return (
      <Tooltip
        arrowPointAtCenter
        placement="bottomRight"
        title="在 Github 中查看"
      >
        <Button
          type="text"
          shape="circle"
          target="_blank"
          href={githubBaseLink + props.githubPath}
          icon={<GithubOutlined />}
        />
      </Tooltip>
    );
  }

  return (
    <div className="example-header">
      <div
        className="content"
        style={props.contentStyle}
      >
        { props.content ? <span className="content-text">{props.content}</span> : ''} 
        {props.children}
      </div>
      <div className="tools">
        <a href="http://logic-flow.org/examples/" target="_blank">查看全部示例</a>
        {props.githubPath ? getGithubTool() : null}
      </div>
    </div>
  )
};
