const path = require('path')
const webpack = require('webpack')

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463

   */
  /*
  pages: {
    index: {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  */
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    /* svgRule.oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    */
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          // 'primary-color': '#2f54eb',
          'padding-lg': '16px',
          'padding-md': '8px',
          'padding-sm': '4px',
          'padding-xs': '0px',
          'card-head-padding': '4px',
          'card-inner-head-padding': '4px',
          'card-padding-base': '4px',
          'card-padding-wider': '8px',
          'layout-sider-background': '#2f54eb',
          'menu-dark-submenu-bg': '#0544a3',
          'menu-dark-bg': '#2f54eb',
          'menu-item-height': '48px',
          'menu-inline-toplevel-item-height': '48px',
          'form-item-margin-bottom': '8px',
          'menu-collapsed-width': '64px',
          'tabs-card-height': '32px',
          'tabs-bar-margin': '0px'
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    // 开发环境端口号
    port: 8080,
    // 服务代理配置
    proxy: {
      // 统一后台服务地址
      '/api': {
        // target: 'http://localhost:8765',
        // target: 'http://10.11.24.129:8765',
        target: 'http://47.99.247.83:8765',
        ws: false,
        changeOrigin: true
      },
      // 项目单元服务地址
      '/project': {
        target: 'http://10.11.24.129:8763',
        ws: false,
        changeOrigin: true
      },
      // 用户头像文件存储服务地址
      '/group1/M00': {
        // target: 'http://10.11.24.138:80',
        target: 'http://47.99.247.83:80',
        ws: false,
        changeOrigin: true
      },
      // 文件服务器,对应服务的地址
      '/fdfs': {
        // target: ' http://localhost:8771',
        target: ' http://47.99.247.83:8771',
        ws: false,
        changeOrigin: true
      }
    }
  },
  // disable source map in production
  productionSourceMap: false,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}
