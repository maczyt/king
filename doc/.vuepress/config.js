module.exports = {
  title: 'King源码解析',
  descripton: '类Vue框架的从0到1',
  base: '/king/',

  themeConfig: {
    sidebar: [
      ['/', '首页'],
      ['data.md', 'data处理'],
      ['compile.md', 'html处理'],
      ['computed.md', 'computed处理']
    ],
  },

  plugins: {
    '@vuepress/back-to-top': true,
  }
}