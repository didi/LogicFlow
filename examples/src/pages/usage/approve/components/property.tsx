import React from 'react';
import { Form, Select, Input, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { approveUser } from '../config';
import { IApproveUser } from '../type';
import 'antd/dist/antd.css';
// @ts-ignore
export default function PropertyPanel(nodeData, updateproperty, hidePropertyPanel) {
  const getApproveList = () => {
    const approveUserOption: JSX.Element[] = []
    approveUser.forEach((item: IApproveUser) => {
      approveUserOption.push(<Select.Option value={item.value}>{item.label}</Select.Option>);
    });
    const approveSelect = <Form.Item className="form-property" label="审核节点类型" name="approveType">
      <Select>
        {approveUserOption}
    </Select>
    </Form.Item>
    return approveSelect;
  }
  const getApiUrl = () => {
    const Api = <Form.Item label="API" name="api">
      <Input />
    </Form.Item>
    return Api;
  }
  const onFormLayoutChange = (value: any, all: any) => {
    approveUser.forEach(item => {
      if (item.value === value.approveType) {
        value['approveTypeLabel'] = item.label;
      }
    })
    updateproperty(nodeData.id, value,);
  }
  return (
    <div>
      <h2>属性面板</h2>
      <Form
        key={nodeData.id}
        layout="inline"
        initialValues={nodeData.properties}
        onValuesChange={onFormLayoutChange}
      >
        <span className="form-property">类型：<span>{nodeData.type}</span></span>
        <span className="form-property">文案：<span>{nodeData.text?.value}</span></span>
        {nodeData.type==="approver" ? getApproveList() : ''}
        {nodeData.type === "jugement" ? getApiUrl() : ''}
      </Form>
      <div>
        <h3>......</h3>
        <h3>业务属性可根据需要进行自定义扩展</h3>
      </div>
      <div className="property-panel-footer">
        <Button
          className="property-panel-footer-hide"
          type="primary"
          icon={<DownOutlined/>}
          onClick={hidePropertyPanel}>
          收起
        </Button>
      </div>
    </div>
  )
}