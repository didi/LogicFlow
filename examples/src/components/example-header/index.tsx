import React, { ReactElement, CSSProperties } from 'react';
import './style.css';

type IProps = {
  content?: string;
  children?: any;
  contentStyle?: CSSProperties;
};

export default function ExampleHeader(props: IProps): ReactElement {
  return (
    <div className="example-header">
      <div
        className="content"
        style={props.contentStyle}
      >
        <span className="content-text">{props.content}</span>
        {props.children}
      </div>
      {/* <div className="tools">some tools 🥳 🤯 🤩</div> */}
    </div>
  )
};
