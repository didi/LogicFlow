import { defineConfig } from 'dumi';
import { repository, version } from './package.json';
import CompressionPlugin from 'compression-webpack-plugin';
import * as process from 'node:process';

export default defineConfig({
  locales: [
    { id: 'zh', name: '中文' },
    { id: 'en', name: 'English' },
  ],
  favicons: [
    'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/favicon.png',
  ], // 网站 favicon
  themeConfig: {
    title: 'LogicFlow',
    description: '低成本实现，让逻辑管理更简单、更高效',
    siteUrl: '/',
    footer: `Copyright © 2024 | Powered by LogicFlow Team`,
    githubUrl: repository, // GitHub 地址
    defaultLanguage: 'zh',
    es5: false,
    footerTheme: 'light',
    useSpeedInsights: false,
    showSearch: true, // 是否显示搜索框
    showLFBanner: true, // Banner是否以 Demo 的形式展示
    showGithubCorner: true, // 是否显示头部的 GitHub icon
    showGithubStars: true, // 是否显示 GitHub star 数量
    showLanguageSwitcher: true, // 是否显示官网语言切换
    showWxQrcode: true, // 是否显示头部菜单的微信公众号
    showChartResize: true, // 是否在 demo 页展示图表视图切换
    showAPIDoc: false, // 是否在 demo 页展示API文档

    versions: {
      '2.x': 'https://site.logic-flow.cn',
      '1.x': 'https://docs.logic-flow.cn',
    },

    navs: [
      {
        slug: 'docs/tutorial/about',
        title: {
          zh: '教程',
          en: 'Tutorial',
        },
        order: 0,
      },
      {
        slug: 'docs/api',
        title: {
          zh: 'API',
          en: 'API',
        },
        order: 1,
      },
      {
        slug: 'examples',
        title: {
          zh: '图表示例',
          en: 'Examples',
        },
        order: 2,
      },
      {
        slug: 'docs/article',
        title: {
          zh: '相关文章',
          en: 'Articles',
        },
        order: 3,
      },
      {
        slug: 'docs/release',
        title: {
          zh: '更新日志',
          en: 'CHANGELOG',
        },
        order: 4,
      },
    ],

    docs: [
      {
        slug: 'tutorial/basic',
        title: {
          zh: '基础教程',
          en: 'Basic',
        },
        order: 3,
      },
      {
        slug: 'tutorial/advanced',
        title: {
          zh: '进阶教程',
          en: 'Advanced',
        },
        order: 4,
      },
      {
        slug: 'tutorial/extension',
        title: {
          zh: '插件',
          en: 'Extension',
        },
        order: 5,
      },
      {
        slug: 'api/model',
        title: {
          zh: 'Model定义',
          en: 'Models',
        },
        order: 6,
      },
      {
        slug: 'api/detail',
        title: {
          zh: '构造函数',
          en: 'Constructor',
        },
        order: 1,
      },
      {
        slug: 'article/extension',
        title: {
          zh: '插件实现原理',
          en: 'Extension Implementation Principles',
        },
        order: 6,
      },
    ],

    // 示例页菜单配置
    examples: [
      {
        slug: 'showcase',
        icon: 'case',
        title: {
          zh: '场景案例',
          en: 'Case',
        },
      },
      {
        slug: 'graph',
        icon: 'graph',
        title: {
          zh: '画布',
          en: 'Graph',
        },
      },
      {
        slug: 'node',
        icon: 'node',
        title: {
          zh: '节点',
          en: 'Node',
        },
      },
      {
        slug: 'edge',
        icon: 'edge',
        title: {
          zh: '边',
          en: 'Edge',
        },
      },
      {
        slug: 'react',
        icon: 'react',
        title: {
          zh: 'react',
          en: 'React',
        },
      },
      {
        slug: 'extension',
        icon: 'extension',
        title: {
          zh: '插件',
          en: 'Extension',
        },
      },
    ],
    /** 首页特性介绍 */
    features: {
      style: {
        paddingTop: 50,
      },
      // title: {
      //   zh: '我们的优势',
      //   en: 'Our advantage',
      // },
      cards: [
        {
          icon: 'icon-liuchengtu',
          title: {
            zh: '可视化模型',
            en: 'The Visualization model',
          },
          description: {
            zh: '通过 LogicFlow 提供的直观可视化界面，用户可以轻松创建、编辑和管理复杂的逻辑流程图。',
            en: 'With the intuitive visual interface provided by LogicFlow, users can easily create, edit, and manage complex logical flowcharts.',
          },
        },
        {
          icon: 'icon-leftfont-07',
          title: {
            zh: '高可定制性',
            en: 'High customizability',
          },
          description: {
            zh: '用户可以根据自己的需要定制节点、连接器和样式，创建符合特定用例的定制逻辑流程图。',
            en: 'Users can customize nodes, connectors, and styles to suit their needs, creating custom logical flowcharts that match specific use cases.',
          },
        },
        {
          icon: 'icon-chajian1',
          title: {
            zh: '灵活易拓展',
            en: 'Flexible and expandable',
          },
          description: {
            zh: '内置提供丰富的插件，用户也可根据自身需求定制复杂插件实现业务需求。',
            en: 'The execution engine supports browser-side flow chart logic, providing new ideas for code-free execution.',
          },
        },
      ],
    },
    /** 首页案例 */
    cases: [
      {
        logo: 'https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/online-commissioning-icon.png',
        title: {
          zh: '在线调试',
          en: 'Online Debugging',
        },
        description: {
          zh: '基于内置能力提供丰富的示例供用户在线调试，帮助用户低成本了解LogicFlow的使用方式和能力。',
          en: 'Based on the built-in capabilities, a wealth of examples are provided for users to debug online, helping users understand the usage and capabilities of LogicFlow at a low cost.',
        },
        // link: `/examples/gallery`,
        image:
          'https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/high-quality-plugins.png',
      },
    ],
    companyGallery: {
      name: '企业用户展示墙',
      img: 'https://s3-gzpu.didistatic.com/ese-feedback/LogicFlow/comanylist.png',
    },
    /** 首页合作公司 */
    companies: [
      // {
      //   name: '滴滴',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/companylist-zip.png',
      // },
      // {
      //   name: '京东',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/JDLogo.svg',
      // },
      // {
      //   name: '华为数字能源',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/HWLogo.svg',
      // },
      // {
      //   name: '美团',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/MTLogo.svg',
      // },
      // {
      //   name: '中国科学院',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/CAOS%20Logo.svg',
      // },
      // {
      //   name: '中国民生银行',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/CMSBLogo.svg',
      // },
      // {
      //   name: '中国招商银行',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/CMBLogo.svg',
      // },
      // {
      //   name: '中国农业银行',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/ABOCLogo.svg',
      // },
      // {
      //   name: '海信',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/HXLogo.svg',
      // },
      // {
      //   name: 'Vivo',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/ViVoLogo.svg',
      // },
      // {
      //   name: '太极计算机',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/TJLogo.svg',
      // },
      // {
      //   name: 'Moka',
      //   img: 'https://cdn.jsdelivr.net/gh/Logic-Flow/static@latest/docs/homepage/MokaLogo.svg',
      // },
    ],

    detail: {
      engine: {
        zh: 'LogicFlow',
        en: 'LogicFlow',
      },
      title: {
        zh: 'LogicFlow·业务流程图编辑框架',
        en: 'LogicFlow·业务流程图编辑框架',
      },
      description: {
        zh: '低成本实现，让逻辑管理更简单、更高效',
        en: 'Low-cost implementation for simpler, more efficient logic management',
      },
      image:
        'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*5qQsTo0dkOcAAAAAAAAAAAAADmJ7AQ/original',
      imageStyle: {
        transform: 'scale(0.7)',
        marginTop: '70px',
        marginLeft: '100px',
      },
      buttons: [
        {
          text: {
            zh: '开始使用',
            en: 'Getting Started',
          },
          type: 'primary',
          link: `/tutorial/get-started`,
        },
        {
          text: {
            zh: '图表示例',
            en: 'Examples',
          },
          link: `/examples`,
        },
      ],
      advantages: [
        {
          icon: 'icon-liuchengtu',
          advantageStyle: {
            background: '#fdfcdf',
            color: '#FFCA40',
          },
          iconStyle: {
            fontSize: '42px',
            color: '#FFCA40',
            strokeWidth: 10,
            stroke: '#FFCA40',
          },
          position: {
            x: 0,
            y: 650,
          },
          // title: {
          //   zh: '可视化模型',
          //   en: 'The Visualization model',
          // },
        },
        {
          icon: 'icon-leftfont-07',
          advantageStyle: {
            background: '#B5AdF9',
            borderRadius: 20,
          },
          iconStyle: {
            fontSize: '36px',
            color: '#F8F6FF',
            strokeWidth: 10,
            stroke: '#F8F6FF',
          },
          position: {
            x: 1890,
            y: 430,
          },
        },
        {
          icon: 'icon-chajian1',
          advantageStyle: {
            background: '#fff',
          },
          iconStyle: {
            fontSize: '36px',
            color: '#333',
            strokeWidth: 10,
            stroke: '#333',
          },
          position: {
            x: 1720,
            y: 180,
          },
        },
      ],
    },
    playground: {
      extraLib: '',
      container:
        '<div id="container" style="min-width: 400px; min-height: 600px;"></div>',
      devDependencies: {
        typescript: 'latest',
      },
    },
  },
  // TODO: 开启 mako 打包，目前会导致 Examples 模块不可用，暂时关闭，恢复至 webpack 打包
  // mako: {},
  // TODO: 开启 SSR 后，umi.server.js 中 process.versions.node.split(".") 会报错， Cannot read properties of undefined (reading 'split')
  // ssr: {}, // 先关闭，后续测试是否由 LogicFlow 引起报错，目前看是 umi 的原因
  mfsu: {},
  alias: {
    '@': __dirname,
  },
  links: [],
  scripts: [],
  headScripts: [],
  lessLoader: {
    lessOptions: {
      javascriptEnabled: true,
    },
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
      'antd',
    ],
    // 下面的 @ant-design/icons 和 lodash-es 需要按需加载，但目前看来不起作用（或者是起作用了，就那么大。需要确认下）
    [
      'import',
      {
        libraryName: '@ant-design/icons',
        libraryDirectory: 'es/icons', // 指定图标路径
        camel2DashComponentName: false, // 禁用驼峰转换
      },
      '@ant-design/icons',
    ],
    [
      'import',
      {
        libraryName: 'lodash-es',
        libraryDirectory: '',
        camel2DashComponentName: false,
      },
      'lodash-es',
    ],
  ],
  codeSplitting: { jsStrategy: 'granularChunks' },
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      // 设置资源 gzip 压缩
      config.plugin('compression-webpack-plugin').use(CompressionPlugin, [
        {
          algorithm: 'gzip',
          test: /\.js$|\.css$|\.html$/, // 匹配文件名
          threshold: 10240, // 对超过 10K 的数据压缩
          deleteOriginalAssets: false, // 不删除源文件
        },
      ]);

      // 打开 bundle 分析器
      // config
      //   .plugin('webpack-bundle-analyzer')
      //   .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
    }

    return config;
  },
});
