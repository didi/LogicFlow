import { CustomImage } from '@/components/CustomHtml';

// 云形状的图片节点
class EndNode extends CustomImage.view {
  getImageHref = () => {
    return 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/core/end.png';
  };
}

export default {
  type: 'end',
  view: EndNode,
  model: CustomImage.model,
};
