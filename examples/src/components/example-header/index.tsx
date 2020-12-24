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
        {props.content}{props.children}
      </div>
      {/* <div className="tools">some tools 🥳 🤯 🤩</div> */}
    </div>
  )
};
