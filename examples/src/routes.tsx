import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Start from './pages/start';
import Dnd from './pages/basic/dnd';
import Grid from './pages/basic/grid';
import Node from './pages/basic/node';
import Edge from './pages/basic/edge';
import Bpmn from './pages/extension/bpmn';
import Keyboard from './pages/basic/keyboard';
import RedoUndo from './pages/basic/redoundo';
import Snapline from './pages/basic/sanpline';
import Silent from './pages/basic/silent-mode';
import Theme from './pages/advance/theme';
import Snapshot from './pages/extension/snapshot';
import Control from './pages/extension/tools/control';
import Menu from './pages/extension/tools/menu';
import TextEdit from './pages/extension/tools/text-edit';
import CustomMenu from './pages/extension/tools/custom-menu';
import CustomNodeContent from './pages/advance/custom-node/content';
import CustomNodeShape from './pages/advance/custom-node/shape';
import CustomNodeProperties from './pages/advance/custom-node/properties';
import CustomNodeEdge from './pages/advance/custom-node/edge';
import CustomEdge from './pages/advance/custom-edge';
import Event from './pages/advance/event';
import Approve from './pages/approve';
import ApprovePreview from './pages/approvePreview';

export default (
  <Switch>
    <Route path="/basic/node" exact component={Node} />
    <Route path="/basic/edge" exact component={Edge} />
    <Route path="/basic/dnd" exact component={Dnd} />
    <Route path="/basic/keyboard" exact component={Keyboard} />
    <Route path="/basic/grid" exact component={Grid} />
    <Route path="/basic/redoundo" exact component={RedoUndo} />
    <Route path="/basic/snapline" exact component={Snapline} />
    <Route path="/basic/silent-mode" exact component={Silent} />
    <Route path="/advance/theme" exact component={Theme} />
    <Route path="/advance/event" exact component={Event} />
    <Route path="/advance/custom-node/content" exact component={CustomNodeContent} />
    <Route path="/advance/custom-node/shape" exact component={CustomNodeShape} />
    <Route path="/advance/custom-node/properties" exact component={CustomNodeProperties} />
    <Route path="/advance/custom-node/edge" exact component={CustomNodeEdge} />
    <Route path="/advance/customEdge" exact component={CustomEdge} />
    <Route path="/extension/bpmn" exact component={Bpmn}/>
    <Route path="/extension/snapshot" exact component={Snapshot} />
    <Route path="/extension/tools/control" exact component={Control} />
    <Route path="/extension/tools/menu" exact component={Menu} />
    <Route path="/extension/tools/text-edit" exact component={TextEdit} />
    <Route path="/extension/tools/custom-menu" exact component={CustomMenu} />
    <Route path="/extension/approve" exact component={Approve} />
    <Route path="/extension/approve/preview" exact component={ApprovePreview} />
    <Route path="/" component={Start} />
  </Switch>
);
