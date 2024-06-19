<p align="center">
  <a href="https://site.logic-flow.cn" target="_blank">
    <img
      src="https://site.logic-flow.cn/logo.png"
      alt="LogicFlow logo"
      width="100"
    />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@logicflow/core">
    <img src="https://img.shields.io/npm/v/@logicflow/core" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/@logicflow/core">
    <img src="https://img.shields.io/npm/dm/@logicflow/core" alt="Download">
  </a>
  <a href="https://github.com/didi/LogicFlow/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/@logicflow/core" alt="LICENSE">
  </a>
</p>

简体中文 | [English](/README.en-US.md)

LogicFlow 是一款流程图编辑框架，提供了一系列流程图交互、编辑所必需的功能和简单灵活的节点自定义、插件等拓展机制，方便我们快速在业务系统内满足类流程图的需求。

## 核心能力

---
- 高可定制性：自定义能力，支持 SVG、HTML、React、Vue 等自定义节点；边的富文本编辑
- 丰富的插件
- 可视化模型：MVVM
- 自执行引擎
- 数据可转换：BPMN、...

## 安装

---
```shell
# npm
$ npm install @logicflow/core @logicflow/extension --save

# yarn
$ yarn add @logicflow/core @logicflow/extension

# pnpm
$ pnpm add @logicflow/core @logicflow/extension
```

## 快速上手

---
```html
<!-- LogicFlow 容器 DOM-->
<div id="container"></div>;
```
```typescript
// 准备数据
const data = {
  // 节点
  nodes: [
    {
      id: '21',
      type: 'rect',
      x: 100,
      y: 200,
      text: '矩形节点',
    },
    {
      id: '50',
      type: 'circle',
      x: 300,
      y: 400,
      text: '圆形节点',
    },
  ],
  // 边
  edges: [
    {
      type: 'polyline',
      sourceNodeId: '50',
      targetNodeId: '21',
    },
  ],
};
// 渲染画布
const lf = new LogicFlow({
  container: document.querySelector('#container'),
  width: 700,
  height: 600,
});

lf.render(data);
```

## 相关文档

---
[官方文档](https://site.logic-flow.cn/)

- [快速上手](https://site.logic-flow.cn/tutorial/getting-started)
- [示例](https://site.logic-flow.cn/examples)
- [文章](https://site.logic-flow.cn/article/article01)

[更新日志]()
[常见问题]()
[issue模板]()

## 本地开发

---
```shell
# 安装项目依赖和初始化构建
$ pnpm install

# 进入到指定项目开发和调试
cd packages/core
pnpm run build:watch

# 启动 example 查看效果
cd examples/feature-examples
pnpm run start
```

## 参与共建
如果希望参与到 LogicFlow 的开发中，请遵从我们的[贡献指南](/CONTRIBUTING.md)。如果你贡献度足够活跃，你可以申请成为社区协作者。

<!-- readme: contributors -start -->
<table>
	<tbody>
		<tr>
            <td align="center">
                <a href="https://github.com/towersxu">
                    <img src="https://avatars.githubusercontent.com/u/4093984?v=4" width="100;" alt="towersxu"/>
                    <br />
                    <sub><b>xutao</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/xinxin93">
                    <img src="https://avatars.githubusercontent.com/u/22070484?v=4" width="100;" alt="xinxin93"/>
                    <br />
                    <sub><b>xinxin93</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/yhlchao">
                    <img src="https://avatars.githubusercontent.com/u/33980809?v=4" width="100;" alt="yhlchao"/>
                    <br />
                    <sub><b>Rain</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/wumail">
                    <img src="https://avatars.githubusercontent.com/u/56008486?v=4" width="100;" alt="wumail"/>
                    <br />
                    <sub><b>Lv.1 wumail</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/sunyongjian">
                    <img src="https://avatars.githubusercontent.com/u/18378034?v=4" width="100;" alt="sunyongjian"/>
                    <br />
                    <sub><b>JoYous-SUN</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/MvCraK">
                    <img src="https://avatars.githubusercontent.com/u/20339028?v=4" width="100;" alt="MvCraK"/>
                    <br />
                    <sub><b>CraK</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/boyongjiong">
                    <img src="https://avatars.githubusercontent.com/u/8553969?v=4" width="100;" alt="boyongjiong"/>
                    <br />
                    <sub><b>你说呢？</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/wbccb">
                    <img src="https://avatars.githubusercontent.com/u/113362874?v=4" width="100;" alt="wbccb"/>
                    <br />
                    <sub><b>CB</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/muyuanshan">
                    <img src="https://avatars.githubusercontent.com/u/51943988?v=4" width="100;" alt="muyuanshan"/>
                    <br />
                    <sub><b>muyuanshan</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/DymoneLewis">
                    <img src="https://avatars.githubusercontent.com/u/35758043?v=4" width="100;" alt="DymoneLewis"/>
                    <br />
                    <sub><b>DymoneLewis</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Akhil-Yuan">
                    <img src="https://avatars.githubusercontent.com/u/77666156?v=4" width="100;" alt="Akhil-Yuan"/>
                    <br />
                    <sub><b>Akhil-Yuan</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/shanquanyaoyue">
                    <img src="https://avatars.githubusercontent.com/u/111632046?v=4" width="100;" alt="shanquanyaoyue"/>
                    <br />
                    <sub><b>山泉曜月</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/wuchenguang1998">
                    <img src="https://avatars.githubusercontent.com/u/63847336?v=4" width="100;" alt="wuchenguang1998"/>
                    <br />
                    <sub><b>wuchenguang1998</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ChengranYan">
                    <img src="https://avatars.githubusercontent.com/u/22503258?v=4" width="100;" alt="ChengranYan"/>
                    <br />
                    <sub><b>ChengranYan</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/xiaoxian521">
                    <img src="https://avatars.githubusercontent.com/u/44761321?v=4" width="100;" alt="xiaoxian521"/>
                    <br />
                    <sub><b>xiaoming</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ZhangMingZhao1">
                    <img src="https://avatars.githubusercontent.com/u/29058747?v=4" width="100;" alt="ZhangMingZhao1"/>
                    <br />
                    <sub><b>Lawliet</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/lww117">
                    <img src="https://avatars.githubusercontent.com/u/18193440?v=4" width="100;" alt="lww117"/>
                    <br />
                    <sub><b>wanwan</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/way2ex">
                    <img src="https://avatars.githubusercontent.com/u/24694223?v=4" width="100;" alt="way2ex"/>
                    <br />
                    <sub><b>Justin Zhu</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/Serendipity96">
                    <img src="https://avatars.githubusercontent.com/u/23514812?v=4" width="100;" alt="Serendipity96"/>
                    <br />
                    <sub><b>Serendipity96</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/guozhenyi">
                    <img src="https://avatars.githubusercontent.com/u/5993771?v=4" width="100;" alt="guozhenyi"/>
                    <br />
                    <sub><b>Jerry</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/KeyToLove">
                    <img src="https://avatars.githubusercontent.com/u/54970106?v=4" width="100;" alt="KeyToLove"/>
                    <br />
                    <sub><b>KeyToLove</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/juzhiyuan">
                    <img src="https://avatars.githubusercontent.com/u/2106987?v=4" width="100;" alt="juzhiyuan"/>
                    <br />
                    <sub><b>琚致远 / Zhiyuan Ju</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/OSpoon">
                    <img src="https://avatars.githubusercontent.com/u/10126623?v=4" width="100;" alt="OSpoon"/>
                    <br />
                    <sub><b>小鑫同学</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/hmilin">
                    <img src="https://avatars.githubusercontent.com/u/41232645?v=4" width="100;" alt="hmilin"/>
                    <br />
                    <sub><b>hmilin</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/gh565923562">
                    <img src="https://avatars.githubusercontent.com/u/18308819?v=4" width="100;" alt="gh565923562"/>
                    <br />
                    <sub><b>Mr.Wang</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/cpf23333">
                    <img src="https://avatars.githubusercontent.com/u/39972632?v=4" width="100;" alt="cpf23333"/>
                    <br />
                    <sub><b>cpf23333</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/btea">
                    <img src="https://avatars.githubusercontent.com/u/24516654?v=4" width="100;" alt="btea"/>
                    <br />
                    <sub><b>btea</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/oe">
                    <img src="https://avatars.githubusercontent.com/u/1655294?v=4" width="100;" alt="oe"/>
                    <br />
                    <sub><b>Saiya</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Oliwans">
                    <img src="https://avatars.githubusercontent.com/u/9619555?v=4" width="100;" alt="Oliwans"/>
                    <br />
                    <sub><b>Oliwans</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/s-boaz">
                    <img src="https://avatars.githubusercontent.com/u/34855763?v=4" width="100;" alt="s-boaz"/>
                    <br />
                    <sub><b>_Boaz_</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/APTX4869-Kun-01">
                    <img src="https://avatars.githubusercontent.com/u/52144745?v=4" width="100;" alt="APTX4869-Kun-01"/>
                    <br />
                    <sub><b>Kun</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/jiangxiaoxin">
                    <img src="https://avatars.githubusercontent.com/u/5708043?v=4" width="100;" alt="jiangxiaoxin"/>
                    <br />
                    <sub><b>jiangxiaoxin</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/lfeiniao">
                    <img src="https://avatars.githubusercontent.com/u/16774827?v=4" width="100;" alt="lfeiniao"/>
                    <br />
                    <sub><b>lfeiniao</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Litor">
                    <img src="https://avatars.githubusercontent.com/u/8906885?v=4" width="100;" alt="Litor"/>
                    <br />
                    <sub><b>Litor</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/yj-liuzepeng">
                    <img src="https://avatars.githubusercontent.com/u/75007029?v=4" width="100;" alt="yj-liuzepeng"/>
                    <br />
                    <sub><b>zepeng</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/paddingme">
                    <img src="https://avatars.githubusercontent.com/u/5771087?v=4" width="100;" alt="paddingme"/>
                    <br />
                    <sub><b>PaddingMe</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/sakuraro">
                    <img src="https://avatars.githubusercontent.com/u/13799413?v=4" width="100;" alt="sakuraro"/>
                    <br />
                    <sub><b>sakuraro</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/softworm">
                    <img src="https://avatars.githubusercontent.com/u/6385868?v=4" width="100;" alt="softworm"/>
                    <br />
                    <sub><b>softworm</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/hahahahahahahahahi">
                    <img src="https://avatars.githubusercontent.com/u/115341488?v=4" width="100;" alt="hahahahahahahahahi"/>
                    <br />
                    <sub><b>weixiao</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/yesw6a">
                    <img src="https://avatars.githubusercontent.com/u/32833804?v=4" width="100;" alt="yesw6a"/>
                    <br />
                    <sub><b>w6a</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/shania-li-xian">
                    <img src="https://avatars.githubusercontent.com/u/56332243?v=4" width="100;" alt="shania-li-xian"/>
                    <br />
                    <sub><b>shania-li-xian</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Shine0917">
                    <img src="https://avatars.githubusercontent.com/u/32087837?v=4" width="100;" alt="Shine0917"/>
                    <br />
                    <sub><b>zhaoxia.xiao</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/ly525">
                    <img src="https://avatars.githubusercontent.com/u/12668546?v=4" width="100;" alt="ly525"/>
                    <br />
                    <sub><b>小小鲁班</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/fangl">
                    <img src="https://avatars.githubusercontent.com/u/9861668?v=4" width="100;" alt="fangl"/>
                    <br />
                    <sub><b>fangl</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/cyt68">
                    <img src="https://avatars.githubusercontent.com/u/20410138?v=4" width="100;" alt="cyt68"/>
                    <br />
                    <sub><b>cyt68</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/wertee20">
                    <img src="https://avatars.githubusercontent.com/u/114274290?v=4" width="100;" alt="wertee20"/>
                    <br />
                    <sub><b>We</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ryan-di">
                    <img src="https://avatars.githubusercontent.com/u/47294779?v=4" width="100;" alt="ryan-di"/>
                    <br />
                    <sub><b>Ryan Di</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ZhaoQi99">
                    <img src="https://avatars.githubusercontent.com/u/25344334?v=4" width="100;" alt="ZhaoQi99"/>
                    <br />
                    <sub><b>Qi Zhao</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/yyISACoder">
                    <img src="https://avatars.githubusercontent.com/u/25174576?v=4" width="100;" alt="yyISACoder"/>
                    <br />
                    <sub><b>Mr.Carl</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/WangJincheng4869">
                    <img src="https://avatars.githubusercontent.com/u/41162158?v=4" width="100;" alt="WangJincheng4869"/>
                    <br />
                    <sub><b>Kirito丶城</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/Jedliu">
                    <img src="https://avatars.githubusercontent.com/u/771703?v=4" width="100;" alt="Jedliu"/>
                    <br />
                    <sub><b>Jed</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/isCopyman">
                    <img src="https://avatars.githubusercontent.com/u/25970108?v=4" width="100;" alt="isCopyman"/>
                    <br />
                    <sub><b>highbro</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/hengistchan">
                    <img src="https://avatars.githubusercontent.com/u/46242125?v=4" width="100;" alt="hengistchan"/>
                    <br />
                    <sub><b>HJ</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/ChengDale">
                    <img src="https://avatars.githubusercontent.com/u/48654076?v=4" width="100;" alt="ChengDale"/>
                    <br />
                    <sub><b>ChengDale</b></sub>
                </a>
            </td>
		</tr>
		<tr>
            <td align="center">
                <a href="https://github.com/ChangeSuger">
                    <img src="https://avatars.githubusercontent.com/u/53229974?v=4" width="100;" alt="ChangeSuger"/>
                    <br />
                    <sub><b>Camille</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/baboon-king">
                    <img src="https://avatars.githubusercontent.com/u/63645337?v=4" width="100;" alt="baboon-king"/>
                    <br />
                    <sub><b>BaboonKing</b></sub>
                </a>
            </td>
            <td align="center">
                <a href="https://github.com/sdm-seven">
                    <img src="https://avatars.githubusercontent.com/u/3292486?v=4" width="100;" alt="sdm-seven"/>
                    <br />
                    <sub><b>Aim</b></sub>
                </a>
            </td>
		</tr>
	<tbody>
</table>
<!-- readme: contributors -end -->

## 开源协议
该项目的代码和文档基于 [Apache-2.0 License](/LICENSE) 开源协议。
