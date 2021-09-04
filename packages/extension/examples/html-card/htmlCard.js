class HtmlCard extends HtmlNode {
  shouldUpdate() {
    const { properties } = this.getAttributes();
    if (this.currrentProperties && this.currrentProperties === JSON.stringify(properties)) return false;
    this.currrentProperties = JSON.stringify(properties)
    return true;
  }
  // 重写HtmlNode的setHtml，来控制html节点内容。
  setHtml(rootEl) {
    // todo: 和react不一样，还没有找到合适的利用vue内置的diff算法来计算节点是否需要更新。
    if (!this.shouldUpdate()) return;
    // const { properties } = this.getAttributes();
    const cardEl = this.getCardEl();
    rootEl.innerHtml = '';
    rootEl.appendChild(cardEl);
  }
  getCardEl() {
    const { properties } = this.getAttributes();
    const el = document.createElement('div');
    el.className = 'html-card';

    const header = document.createElement('div');
    header.className = 'html-card-header';
    header.innerText = properties.title;

    const body = document.createElement('div');
    body.className = 'html-card-body';
    body.innerText = properties.content;

    const footer = document.createElement('div');
    footer.className = 'html-card-footer';

    if (properties.answers) {
      properties.answers.map((answer) => {
        const label = document.createElement('div');
        label.innerText = answer.text;
        label.className = 'html-card-label';
        footer.appendChild(label);
      });
    }

    el.appendChild(header);
    el.appendChild(body);
    el.appendChild(footer);

    return el;
  }
}
class HtmlCardModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 240;
    this.height = 100;
    const { properties } = this;
    if (properties.answers) {
      let preOffset = 5;
      const sourceAnchor = properties.answers.map((answer,) => {
        const text = answer.text;
        const x = preOffset + (this.getBytesLength(text) * 6 + 4) / 2 - this.width / 2;
        preOffset += this.getBytesLength(text) * 6 + 4 + 10;
        return { x: x, y: 45, id: answer.id };
      });
      this.anchorsOffset = [{ x: 0, y: -50}].concat(sourceAnchor);
    }
  }

  getBytesLength (word) {
    if (!word) {
      return 0;
    }
    let totalLength = 0;
    for (let i = 0; i < word.length; i++) {
      const c = word.charCodeAt(i);
      if ((word.match(/[A-Z]/))) {
        totalLength += 1.5;
      } else if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
        totalLength += 1.2;
      } else {
        totalLength += 2;
      }
    }
    return totalLength;
  }
}

export default {
  type: 'html-card',
  view: HtmlCard,
  model: HtmlCardModel,
}