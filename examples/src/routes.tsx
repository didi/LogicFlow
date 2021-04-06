import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Start from './pages/start';
import Dnd from './pages/basic/dnd';
import Grid from './pages/basic/grid';
import Node from './pages/basic/node';
import Edge from './pages/basic/edge';
import Bpmn from './pages/usage/bpmn';
import Keyboard from './pages/basic/keyboard';
import RedoUndo from './pages/basic/redoundo';
import Snapline from './pages/basic/sanpline';
import Silent from './pages/basic/silent-mode';
import Theme from './pages/advance/theme';
import Snapshot from './pages/extension/snapshot';
import Control from './pages/extension/components/control';
import Menu from './pages/extension/components/menu';
import DndPanel from './pages/extension/components/dnd-panel';
import Selection from './pages/extension/components/selection';
import MiniMap from './pages/extension/components/mini-map';
import CustomMenu from './pages/extension/components/custom-menu';
import CustomDnd from './pages/extension/components/custom-dnd';
import CustomNodeStyle from './pages/advance/custom-node/style';
import Anchor from './pages/advance/custom-node/anchor';
import Triangle from './pages/advance/custom-node/triangle';
import Rule from './pages/advance/custom-node/rule';
import Shape from './pages/advance/custom-node/shape';
import Process from './pages/advance/custom-edge/process';
import Arrow from './pages/advance/custom-edge/arrow';
import Event from './pages/advance/event';
import Approve from './pages/usage/approve';
import ApprovePreview from './pages/usage/approvePreview';
import BpmnElements from './pages/extension/bpmn/Elements';
import AdapterExample from './pages/extension/adapter';


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
    <Route path="/advance/custom-node/style" exact component={CustomNodeStyle} />
    <Route path="/advance/custom-node/anchor" exact component={Anchor} />
    <Route path="/advance/custom-node/triangle" exact component={Triangle} />
    <Route path="/advance/custom-node/rule" exact component={Rule} />
    <Route path="/advance/custom-node/shape" exact component={Shape} />
    <Route path="/advance/custom-edge/process" exact component={Process} />
    <Route path="/advance/custom-edge/arrow" exact component={Arrow} />
    <Route path="/extension/snapshot" exact component={Snapshot} />
    <Route path="/extension/components/control" exact component={Control} />
    <Route path="/extension/components/menu" exact component={Menu} />
    <Route path="/extension/components/dnd-panel" exact component={DndPanel} />
    <Route path="/extension/components/selection" exact component={Selection} />
    <Route path="/extension/components/mini-map" exact component={MiniMap} />
    <Route path="/extension/components/custom-menu" exact component={CustomMenu} />
    <Route path="/extension/components/custom-dnd" exact component={CustomDnd} />
    <Route path="/extension/bpmn-elements" exact component={BpmnElements} />
    <Route path="/extension/adapter" exact component={AdapterExample} />
    <Route path="/usage/bpmn" exact component={Bpmn} />
    <Route path="/usage/approve" exact component={Approve} />
    <Route path="/usage/approve/preview" exact component={ApprovePreview} />
    <Route path="/" component={Start} />
  </Switch>
);
