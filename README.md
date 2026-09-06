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

- 可视化模型：通过 LogicFlow 提供的直观可视化界面，用户可以轻松创建、编辑和管理复杂的逻辑流程图。
- 高可定制性：用户可以根据自己的需要定制节点、连接器和样式，创建符合特定用例的定制逻辑流程图。
- 灵活易拓展: 内置提供丰富的插件，用户也可根据自身需求定制复杂插件实现业务需求。
- 自执行引擎: 执行引擎支持浏览器端执行流程图逻辑，为无代码执行提供新思路。
- 数据可转换：支持 LogicFlow 数据与 BPMN、Turbo 等各种后端执行引擎数据结构转换能力。

## 安装

```shell
# npm
$ npm install @logicflow/core @logicflow/extension --save

# yarn
$ yarn add @logicflow/core @logicflow/extension

# pnpm
$ pnpm add @logicflow/core @logicflow/extension
```

## AI 编程支持

LogicFlow 为 AI 编程工具提供了随 npm 包发布的本地文档。`@logicflow/core@2.2.2` 及以上版本会包含这些文档。安装或升级后，可以把下面这段提示词复制给你的 AI Agent，让它在实现 LogicFlow 功能前先查官方文档。

更多说明请查看 [AI 编程支持](https://site.logic-flow.cn/tutorial/ai)。

```md
<!-- BEGIN:logicflow-agent-rules -->
# LogicFlow Agent Rules

LogicFlow documentation is available at:

- `node_modules/@logicflow/core/dist/docs/`

Package roles:

- `@logicflow/core`: core graph editor runtime, including canvas, nodes, edges, models, events, rendering, themes, and basic interactions.
- `@logicflow/extension`: official plugins for common product features.
- `@logicflow/layout`: official layout plugins for automatic graph layout.

The docs for `@logicflow/extension` and `@logicflow/layout` are included under:

- `node_modules/@logicflow/core/dist/docs/tutorial/extension/`

Before implementing any LogicFlow feature, check the local docs first to see whether LogicFlow already provides a built-in, extension, or layout capability. If it does, prefer the documented official capability instead of reimplementing it from scratch.

If an official package is needed but not installed, ask the user before installing it.
<!-- END:logicflow-agent-rules -->
```

## 快速上手

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

[官方文档](https://site.logic-flow.cn/)

- [快速上手](https://site.logic-flow.cn/tutorial/get-started)
- [图表示例](https://site.logic-flow.cn/examples)
- [相关文章](https://site.logic-flow.cn/article/architecture-of-logicflow)

---
- [更新日志](https://github.com/didi/LogicFlow/releases)
- [issue模板](https://github.com/didi/LogicFlow/issues/new/choose)

## [本地开发](/CONTRIBUTING.md)

```shell
# 安装项目依赖（prepare 会自动跑 build:all）
$ pnpm install

# 终端 1：监听 packages，热更新 es/lib
$ pnpm run dev

# 终端 2：启动 demo
$ cd examples/feature-examples && pnpm dev
```

## 参与共建

如果希望参与到 LogicFlow 的开发中，请遵从我们的[贡献指南](/CONTRIBUTING.md)。如果你贡献度足够活跃，你可以申请成为社区协作者。

<a href="https://github.com/didi/LogicFlow/graphs/contributors">
<img src="https://raw.githubusercontent.com/didi/LogicFlow/master/CONTRIBUTORS.svg" alt="Contributors" />
</a>

## Star History

<a href="https://www.star-history.com/#didi/LogicFlow&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=didi/LogicFlow&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=didi/LogicFlow&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=didi/LogicFlow&type=Date" />
 </picture>
</a>

## 开源协议

该项目的代码和文档基于 [Apache-2.0 License](/LICENSE) 开源协议。


## 🌐 Web Resources & Interactive Index
- [PAWS PALS DINER](https://themindplay.github.io/paws-pals-diner.html)
- [BOUNCING CHICK](https://thelearnquester.web.app/bouncing-chick.html)
- [CATEGORY FLASH](https://quizverses-9d2f2.web.app/category-flash.html)
- [ANIMAL MERGE ZOO PARK](https://ilearnworldes.pages.dev/animal-merge-zoo-park.html)
- [SUPERHERO DROP AND SAVE](https://theskillquest.pages.dev/superhero-drop-and-save.html)
- [INDEX28](https://iskillquest.pages.dev/index28.html)
- [CATEGORY STICKMAN](https://studyplayings.web.app/category-stickman.html)
- [MR BEAN JUMP](https://studyplayings.web.app/mr-bean-jump.html)
- [ENERGY SUPERMAN 3D](https://theskillquest.pages.dev/energy-superman-3d.html)
- [TEACHER SIMULATOR CHRISTMAS EXAM](https://theskillquest.pages.dev/teacher-simulator-christmas-exam.html)
- [TILES OF THE UNEXPECTED 2](https://themindzone.pages.dev/tiles-of-the-unexpected-2.html)
- [ROYAL CROWN BLAST](https://theskillquest.pages.dev/royal-crown-blast.html)
- [ONE LINE DRAWING](https://themindzone.pages.dev/one-line-drawing.html)
- [STRIKE FORCE ACTION PLATFORMER](https://theskillquest.pages.dev/strike-force-action-platformer.html)
- [INDEX6](https://learnquester.github.io/index6.html)
- [MINEBLOCK OBBY](https://theskillquest.pages.dev/mineblock-obby.html)
- [EPIC MINE](https://studyquesthub.web.app/epic-mine.html)
- [CATEGORY BUILDING182](https://quizverses.github.io/category-building182.html)
- [CHARGER CITY DRIVER](https://quizverses.github.io/charger-city-driver.html)
- [CATEGORY FLASH](https://theskillquest.pages.dev/category-flash.html)
- [CATEGORY SPEED158](https://theskillquest.pages.dev/category-speed158.html)
- [MECH MONSTER ARENA](https://studyquests.github.io/mech-monster-arena.html)
- [CATEGORY SPACE](https://studyquests.github.io/category-space.html)
- [MIGHTY RUN](https://theskillquest.pages.dev/mighty-run.html)
- [TRAFFIC COP 3D](https://thelearnquester.web.app/traffic-cop-3d.html)
- [LABUBA MERGE](https://theskillquest.pages.dev/labuba-merge.html)
- [WORDS MATCH](https://learnquester.github.io/words-match.html)
- [HUNGRY NOOB CAFE SIMULATOR](https://theskillquest.pages.dev/hungry-noob-cafe-simulator.html)
- [CATEGORY RPG80](https://theskillquest.pages.dev/category-rpg80.html)
- [CATEGORY SIDE SCROLLING184](https://theskillquest.pages.dev/category-side-scrolling184.html)
- [CATEGORY AGILITY](https://theskillquest.pages.dev/category-agility.html)
- [FASHION WEEK 2025](https://studyquests.github.io/fashion-week-2025.html)
- [MERGE PIXEL](https://themindzone.pages.dev/merge-pixel.html)
- [CATEGORY FOOD](https://learnquester.github.io/category-food.html)
- [CATEGORY STRATEGY](https://quizverses-9d2f2.web.app/category-strategy.html)
- [CATEGORY 2D1 070](https://thelearnquester.web.app/category-2d1-070.html)
- [TOYTOPIA](https://theskillquest.pages.dev/toytopia.html)
- [CATEGORY SOLDIER](https://studyquests.github.io/category-soldier.html)
- [CATEGORY FPS GAMES](https://learnquester.github.io/category-fps-games.html)
- [HEX PLANET IDLE](https://quizverses.github.io/hex-planet-idle.html)
- [PUZZLE BLOCKS CLASSIC](https://learnquesters.pages.dev/puzzle-blocks-classic.html)
- [CATEGORY ADVENTURE 2](https://quizverses.github.io/category-adventure-2.html)
- [CATEGORY COOKING](https://learnquester.github.io/category-cooking.html)
- [ARCADE GP](https://themindzone.pages.dev/arcade-gp.html)
- [WORD VOYAGER](https://theskillquest.pages.dev/word-voyager.html)
- [SOLITAIRE QUEST](https://theskillquest.pages.dev/solitaire-quest.html)
- [INDEX2](https://thelearnquester.web.app/index2.html)
- [JIGSORT PUZZLES](https://themindzone.pages.dev/jigsort-puzzles.html)
- [CATEGORY DRAWING34](https://themindplay.pages.dev/category-drawing34.html)
- [FLOOF MY PET HOUSE](https://iskillquest.pages.dev/floof-my-pet-house.html)
- [SHIP CONTROL 3D](https://themindplays.pages.dev/ship-control-3d.html)
- [SMASH THE BOTTLE](https://quizverses.github.io/smash-the-bottle.html)
- [SLIDE RABBIT](https://studyplayings.pages.dev/slide-rabbit.html)
- [GLOSSY BUBBLES CHALLENGE](https://studyplayings.web.app/glossy-bubbles-challenge.html)
- [CRAZY BAR BRAWL](https://studyquests.github.io/crazy-bar-brawl.html)
- [CATEGORY UNBLOCKED WEBSITES](https://studyquests.github.io/category-unblocked-websites.html)
- [INDEX6](https://theskillquest.pages.dev/index6.html)
- [IDOL LIVESTREAM DOLL DRESS UP](https://learnquester.github.io/idol-livestream-doll-dress-up.html)
- [ALPHABET LORE MAZE](https://themindplays.pages.dev/alphabet-lore-maze.html)
- [BLADE FORGE 3D](https://studyquests.github.io/blade-forge-3d.html)
- [CATEGORY PIXEL313](https://thelearnquester.web.app/category-pixel313.html)
- [PARKING FURY 3D NIGHT CITY](https://thelearnquester.web.app/parking-fury-3d-night-city.html)
- [CATEGORY TOWER DEFENSE](https://learnquesters.pages.dev/category-tower-defense.html)
- [COLOR DODGE](https://studyquests.github.io/color-dodge.html)
- [JEWEL LEGEND QUEST](https://themindzone.pages.dev/jewel-legend-quest.html)
- [BUBBLE SHOOTER PANDA BLAST](https://themindplays.pages.dev/bubble-shooter-panda-blast.html)
- [CATEGORY ZOMBIE175](https://theskillquest.pages.dev/category-zombie175.html)
- [CATEGORY GUN241](https://studyplayings.web.app/category-gun241.html)
- [GEOMETRY VIBES X ARROW](https://theskillquest.pages.dev/geometry-vibes-x-arrow.html)
- [POP STAR](https://theskillquest.pages.dev/pop-star.html)
- [INDEX3](https://themindplay.pages.dev/index3.html)
- [CATEGORY EDUCATIONAL](https://theskillquest.pages.dev/category-educational.html)
- [ROAD TO 7](https://theskillquest.pages.dev/road-to-7.html)
- [WEAPONS AND RAGDOLLS](https://theskillquest.pages.dev/weapons-and-ragdolls.html)
- [CUT THE ROPE TIME TRAVEL](https://quizverses.github.io/cut-the-rope-time-travel.html)
- [JUST MAHJONG](https://theskillquest.pages.dev/just-mahjong.html)
- [CATEGORY RACING DRIVING 2](https://learnquester.pages.dev/category-racing-driving-2.html)
- [ANACONDA RUNNER](https://themindplays.pages.dev/anaconda-runner.html)
- [INFINITE CRAFT](https://theskillquest.pages.dev/infinite-craft.html)
- [HIGH HEELS COLLECT RUN](https://studyquests.github.io/high-heels-collect-run.html)
- [ITALIAN BRAINROT JIGSAW](https://themindzone.pages.dev/italian-brainrot-jigsaw.html)
- [THE OFFICE ESCAPE](https://themindplay.github.io/the-office-escape.html)
- [RAINBOW FRIENDS HIDE AND SEEK](https://themindzone.pages.dev/rainbow-friends-hide-and-seek.html)
- [SKIP LOVE](https://themindplay.github.io/skip-love.html)
- [CATEGORY SOCCER 2](https://theskillquest.pages.dev/category-soccer-2.html)
- [BASKET SPORT STARS](https://theskillquest.pages.dev/basket-sport-stars.html)
- [CATEGORY BATTLE ROYALE25](https://quizverses.github.io/category-battle-royale25.html)
- [HORROR FOREST BEAR](https://theskillquest.pages.dev/horror-forest-bear.html)
- [ARCHERS RANDOM](https://theskillquest.pages.dev/archers-random.html)
- [STELLAR FUSION](https://quizverses.github.io/stellar-fusion.html)
- [CARS DERBY ARENA](https://themindzone.pages.dev/cars-derby-arena.html)
- [LABUBU COLORING ADVENTURE](https://theskillquest.pages.dev/labubu-coloring-adventure.html)
- [MEGA FALL RAGDOLL SIMULATOR](https://themindplays.pages.dev/mega-fall-ragdoll-simulator.html)
- [CUT IN HALF](https://themindplays.pages.dev/cut-in-half.html)
- [CATEGORY CASUAL 5](https://learnquesters.pages.dev/category-casual-5.html)
- [SPACE PIN MASTER PULL PIN PUZZLE](https://learnquester.pages.dev/space-pin-master-pull-pin-puzzle.html)
- [SHIP CONTROL 3D](https://quizverses.github.io/ship-control-3d.html)
- [ZOMBIE CHASE](https://themindplays.pages.dev/zombie-chase.html)
- [GUNS BOTTLES](https://iskillquest.pages.dev/guns-bottles.html)
- [STICKMAN LEAVE PRISON](https://theskillquest.pages.dev/stickman-leave-prison.html)
- [CATEGORY SOLITAIRE27](https://studyplayings.web.app/category-solitaire27.html)
- [BOXING FIGHTER](https://studyquests.github.io/boxing-fighter.html)
- [MEDIEVAL ESCAPE](https://studyplayings.pages.dev/medieval-escape.html)
- [CRAFTSMAN 3D GANGSTER](https://theskillquest.pages.dev/craftsman-3d-gangster.html)
- [SAND BLAST BLOCK GAME](https://learnquester.github.io/sand-blast-block-game.html)
- [CLINIC CLEANUP CREW](https://themindzone.pages.dev/clinic-cleanup-crew.html)
- [STEAM SORTER](https://quizverses.github.io/steam-sorter.html)
- [HIDDEN OBJECTS ISLAND SECRETS](https://quizverses.github.io/hidden-objects-island-secrets.html)
- [MY GARDEN JOURNEY](https://learnquester.pages.dev/my-garden-journey.html)
- [PLUG MAN RACE](https://studyquests.github.io/plug-man-race.html)
- [CATEGORY MERGE](https://learnquester.github.io/category-merge.html)
- [TINY GOLF KING](https://quizverses.github.io/tiny-golf-king.html)
- [CATEGORY SPACE57](https://studyquests.github.io/category-space57.html)
- [BEST CLASSIC FREECELL SOLITAIRE](https://themindplay.github.io/best-classic-freecell-solitaire.html)
- [FARM BLAST](https://themindplay.pages.dev/farm-blast.html)
- [SPACEFLIGHT SIMULATOR](https://iskillquest.pages.dev/spaceflight-simulator.html)
- [ART PUZZLE MASTER](https://themindzone.pages.dev/art-puzzle-master.html)
- [CATEGORY SOCCER 3](https://quizverses.github.io/category-soccer-3.html)
- [ARCHERY LEGENDS](https://quizverses.github.io/archery-legends.html)
- [CATEGORY CASUAL](https://learnquesters.pages.dev/category-casual.html)
- [MUKI WIZARD](https://iskillquest.pages.dev/muki-wizard.html)
- [CATEGORY FLASH 2](https://learnquesters.pages.dev/category-flash-2.html)
- [CATEGORY CASUAL 8](https://skillplay.github.io/category-casual-8.html)
- [CATEGORY CASUAL 5](https://skillplay.github.io/category-casual-5.html)
- [CODE MAZE](https://themindplays.pages.dev/code-maze.html)
- [CATEGORY CUTE62](https://quizverses.github.io/category-cute62.html)
- [CATEGORY STICKMAN 2](https://studyplayings.web.app/category-stickman-2.html)
- [HORROR ESCAPE GRANNY ROOM](https://themindzone.pages.dev/horror-escape-granny-room.html)
- [DUO FAMILY SANTA](https://themindzone.pages.dev/duo-family-santa.html)
- [HARBOR OPERATOR](https://themindzone.pages.dev/harbor-operator.html)
