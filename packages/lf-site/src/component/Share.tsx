import { Component, h } from 'preact';
import './share.less';

type IProps = {
  exportIMG: () => void,
  getGraphData: () => void,
};

type IState = {
};

export default class Share extends Component<IProps, IState> {
  render() {
    const { exportIMG, getGraphData } = this.props;
    return (
      <div className="share-container">
        <div>
          <div
            className="export export-img"
            onClick={exportIMG}
            title="导出图片"
          />
          下载
        </div>
        <div>
          <div
            className="export export-data"
            onClick={getGraphData}
            title="获取图数据"
          />
          图数据
        </div>
      </div>
    );
  }
}
