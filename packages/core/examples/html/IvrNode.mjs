// import { HtmlNodeModel, HtmlNode } from '@logicflow/core';
// import { nodeName, featureType } from '../config';
// import { getNodeTypeName, getNodeSubTypeName } from '../util';

// const { HtmlNodeModel } = window;
// const { HtmlNode } = window;

const nodeStyle = {
  width: 200,
  height: 40,
};

function getFeatureSign(feature) {
  let el = '';
  if (feature && feature.type && feature.type === 1) {
    el = `<div class="feature-sign">
    <div class="feature-type">按键</div>
    <div class="feature-value">${feature.ivrValue}</div>
  </div>`;
  }
  return el;
}

function getFeatureList(list) {
  let el = '';
  if (list && list.length > 0) {
    list.forEach(item => {
      el += `<div class="feature-item">
      ${getFeatureSign(item)}
      <div class="feature-name">${item.name}</div>
      </div>`;
    });
  }
  return el;
}
class IvrNodeModel extends HtmlNodeModel {
  getFeatureData() {
    return [];
  }

  // getAnchorsByOffset() {
  //   const { data } = JSON.parse(JSON.stringify(this.properties));
  //   // 如果没有确定节点子类型仅展示左边和上边的锚点
  //   if (!data || !data.subNodeType) {
  //     return [{
  //       id: 'anchor_1',
  //       x: -this.width / 2,
  //       y: 0,
  //       isSourceAnchor: false,
  //       isTargetAnchor: true,
  //     },
  //     {
  //       id: 'anchor_2',
  //       x: 0,
  //       y: -this.height / 2,
  //       isSourceAnchor: false,
  //       isTargetAnchor: true,
  //     }];
  //   }
  //   const { anchorsOffset, x, y, id } = this;
  //   return anchorsOffset.map((el, idx) => {
  //     if (el.length) {
  //       return {
  //         id: `${id}_${idx}`,
  //         x: x + el[0],
  //         y: y + el[1],
  //       };
  //     }
  //     return {
  //       ...el,
  //       x: x + el.x,
  //       y: y + el.y,
  //       id: el.id || `${id}_${idx}`,
  //     };
  //   });
  // }

  getDefaultAnchorList() {
    // 所有锚点都可以连入和连出
    const { id } = this;
    return [
      {
        id: `${id}_anchor_1`,
        x: -this.width / 2,
        y: 0,
        isSourceAnchor: true,
        isTargetAnchor: true,
      },
      {
        id: `${id}_anchor_2`,
        x: 0,
        y: -this.height / 2,
        isSourceAnchor: true,
        isTargetAnchor: true,
      },
      {
        id: `${id}_anchor_3`,
        x: this.width / 2,
        y: 0,
        isSourceAnchor: true,
        isTargetAnchor: true,
      },
      {
        id: `${id}_anchor_4`,
        x: 0,
        y: this.height / 2,
        isSourceAnchor: true,
        isTargetAnchor: true,
      },
    ];
  }

  getAnchorList(featureList) {
    const { id } = this;
    const { data } = JSON.parse(JSON.stringify(this.properties));
    // 如果没有确定节点子类型仅展示左边和上边的锚点
    if (!data || !data.subNodeType) {
      return [
        {
          id: `${id}_anchor_1`,
          x: -this.width / 2,
          y: 0,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: `${id}_anchor_2`,
          x: 0,
          y: -this.height / 2,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
      ];
    }
    const featureLen = (featureList && featureList.length) || 0;
    let anchorList = [];
    let offset = 0;
    // 如果有分支
    if (featureLen) {
      offset = -this.height / 2 + 20;
      // 节点上的三个锚点只允许连入，不允许连出
      anchorList = [
        {
          id: `${id}_anchor_1`,
          x: -this.width / 2,
          y: offset,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: `${id}_anchor_2`,
          x: 0,
          y: -this.height / 2,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
        {
          id: `${id}_anchor_3`,
          x: this.width / 2,
          y: offset,
          isSourceAnchor: false,
          isTargetAnchor: true,
        },
      ];
      // 分支上的锚点只允许连出，不允许连入
      // eslint-disable-next-line no-unused-expressions
      featureList &&
        featureList.length > 0 &&
        featureList.forEach((item, index) => {
          anchorList.push({
            // id: `feature_${index + 1}`,
            x: this.width / 2 - 10,
            y: -this.height / 2 + (55 + 30 * index),
            isSourceAnchor: true,
            isTargetAnchor: false,
            featureConfig: item,
          });
        });
    } else {
      anchorList = this.getDefaultAnchorList();
    }
    // 如果没有分支不进行anchorList特殊处理，默认允许连入和连出
    return anchorList;
  }

  getSourceRules(featureList) {
    const { type, graphModel } = this;
    const name = '未知类型';
    const commonRules = {
      message: `${name}当前锚点不允许连出！`,
      validate(source, target, sourceAnchor) {
        return sourceAnchor.isSourceAnchor;
      },
    };
    const sourceOnlyRules = {
      message: '仅允许一条连线',
      validate: (source, target, sourceAnchor) => {
        let isCanConnect = true;
        const { edges } = graphModel;
        for (let i = 0; i < edges.length; i++) {
          if (edges[i].sourceNodeId === source.id) {
            if (featureList && featureList.length > 0) {
              // 有分支
              const { x, y } = edges[i].startPoint;
              if (x === sourceAnchor.x && y === sourceAnchor.y) {
                isCanConnect = false;
                break;
              }
            } else {
              // 无分支
              isCanConnect = false;
              break;
            }
          }
        }
        return isCanConnect;
      },
    };
    const nodeTules = this.getNodeSourceRules();
    return [...nodeTules, commonRules, sourceOnlyRules];
  }

  getNodeSourceRules() {
    return [];
  }

  getTargetRules() {
    const { type } = this;
    const name = '未知类型';
    const commonRules = {
      message: `${name}分支不允许连入！`,
      validate: (source, target, sourceAnchor, targetAnchor) => targetAnchor.isTargetAnchor,
    };
    const nodeTules = this.getNodeTargetRules();
    return [...nodeTules, commonRules];
  }

  getNodeTargetRules() {
    return [];
  }

  setAttributes() {
    let featureList = [];
    // 确定了子节点类型后，计算其分支属性
    const { data } = this.properties;
    if (data && data.subNodeType) {
      featureList = this.getFeatureData(data);
    }
    const { width, height } = nodeStyle;
    this.width = width;
    this.height = height;
    if (featureList && featureList.length > 0) {
      this.height = height + 30 * featureList.length;
    }
    this.anchorsOffset = this.getAnchorList(featureList);
    const sourceRules = this.getSourceRules(featureList);
    const targetRules = this.getTargetRules();
    this.sourceRules = sourceRules;
    this.targetRules = targetRules;
  }
}

class IvrNode extends HtmlNode {
  getSubNodeName(data) {
    const { subNodeType } = data;
    const subNodeTypeName = '2';
    return subNodeTypeName;
  }

  getFeatureData() {
    return [];
  }

  setHtml(rootEl) {
    const { type, properties } = this.props.model;
    const { data } = JSON.parse(JSON.stringify(properties));
    let name = 'a';
    let featureList = [];
    // 确定了子节点类型后，获取其子类型名称和分支属性
    if (data && data.subNodeType) {
      const subNodeTypeName = this.getSubNodeName(data);
      name = subNodeTypeName ? `${subNodeTypeName}-${data.name}` : name;
      featureList = this.getFeatureData(data);
    }
    const el = document.createElement('div');
    el.className = 'ivr-node';
    const html = `
            <div>
              <div class="node-main ${type}">
              <span class="icon icon-${type}"></span>
              <span class="name">${name}</span>
              </div>
              <div class="node-feature">
              ${getFeatureList(featureList)}
              </div>
            </div>
          `;
    el.innerHTML = html;
    // eslint-disable-next-line
    rootEl.innerHTML = '';
    rootEl.appendChild(el);
  }
}

export {
  IvrNodeModel,
  IvrNode,
};
