# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.0.8](https://github.com/didi/LogicFlow/compare/@logicflow/engine@0.0.6...@logicflow/engine@0.0.8) (2023-09-08)


### Bug Fixes

* 修复 uuid 生成的 id 以 '-' 分隔，在 eval 执行时会报错的 bug ([444e44a](https://github.com/didi/LogicFlow/commit/444e44ae5672e68b7e20d4a8307affb0ac6244fd))
* 修复以 uuid 生成 nodeId 时，isPass 方法会触发 js 错误，导致执行失败 ([3eb4127](https://github.com/didi/LogicFlow/commit/3eb412744395aae64a57656f5fcd7a1e581078d9))
* 添加 debug 参数控制是否实例化 Recorder；修复 sessionStorage 存储超过 5MB 后写入报错的 bug ([03cd521](https://github.com/didi/LogicFlow/commit/03cd521b58c8a5a2be729015844bd97bb560e65f))





## [0.0.6](https://github.com/didi/LogicFlow/compare/@logicflow/engine@0.0.5...@logicflow/engine@0.0.6) (2023-08-24)


### Features

* **engine:** execution record data contain outgoing and detail ([d24533c](https://github.com/didi/LogicFlow/commit/d24533ca4a6d259a3d1921c010056dd9b4db3d3c))
* **engine:** support node return error ([7373bf2](https://github.com/didi/LogicFlow/commit/7373bf2da4a90b2b7610a267259b33daa77fd9de))





## [0.0.5](https://github.com/didi/LogicFlow/compare/@logicflow/engine@0.0.4...@logicflow/engine@0.0.5) (2023-08-23)


### Features

* **engine:** recorder getExecutionList only return instance data ([684a2ba](https://github.com/didi/LogicFlow/commit/684a2ba90c8b94a0cce48200b69119270a3b31b7))





## [0.0.4](https://github.com/didi/LogicFlow/compare/@logicflow/engine@0.0.3...@logicflow/engine@0.0.4) (2023-08-21)


### Bug Fixes

* **engine:** expression can not return right value in browser ([9ef9f2e](https://github.com/didi/LogicFlow/commit/9ef9f2e1080dcfa05002ab0bc25b18c39d2efffd))


### Features

* **engine:** add getExecutionList api ([a907c87](https://github.com/didi/LogicFlow/commit/a907c877512f5c1c62c232f8b2b5e462a9a3ac07))





## [0.0.3](https://github.com/didi/LogicFlow/compare/@logicflow/engine@0.0.2...@logicflow/engine@0.0.3) (2023-08-18)


### Bug Fixes

* **engine:** build error when use es-module ([3fbd88a](https://github.com/didi/LogicFlow/commit/3fbd88a8279602b907ab6f3e3a6353a46f64ee8c))
* **engine:** support es module umd and commonJs ([bb17159](https://github.com/didi/LogicFlow/commit/bb171597725b78b28cc2ad74350ab7728e580158))





## 0.0.2 (2023-08-10)


### Bug Fixes

* **engine:** consistent expression evaluation in browser and nodejs ([8f24045](https://github.com/didi/LogicFlow/commit/8f240451dce588b6fa21e639c79e1a0782937ff9))


### Features

* add support for specifying the start node and multiple executions ([113ad88](https://github.com/didi/LogicFlow/commit/113ad880cdb564431933eeeed3b661c50fca2a9c))
* added expression evaluation functionality for Node.js and browser ([a7759f6](https://github.com/didi/LogicFlow/commit/a7759f69d4f7b294397c8502da654ea7c729d930))
* create logicflow eninge ([c7d80f4](https://github.com/didi/LogicFlow/commit/c7d80f4b4c19cf82af9be49dd8fd44433327db58))
* **engie:** support parallel execution within workflows ([8e17ea6](https://github.com/didi/LogicFlow/commit/8e17ea614c5c3567e532a67240cf8e0e9110b2bf))
* **engine:** add comments and sync storage execution ([6fa0904](https://github.com/didi/LogicFlow/commit/6fa0904ddee88254d4af5c246ff0247c988dfdd2))
* **engine:** add the ability to pause and resume workflows ([7c4e385](https://github.com/didi/LogicFlow/commit/7c4e3855ad0a7af4121de6552be61f690b4e0e6c))
* **engine:** added workflow scheduling feature ([c2a7044](https://github.com/didi/LogicFlow/commit/c2a704449772445387f324924491f15e526dfc4e))
* implemented execution record query functionality ([d73aa46](https://github.com/didi/LogicFlow/commit/d73aa46675f35bae5362e6024232d44cbfe5bcaa))
