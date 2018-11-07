module.exports = {
  title: 'King源码解析',
  description: '类Vue框架的从0到1',
  base: '/king/',

  themeConfig: {
    repo: '/maczyt/king',
    lastUpdated: 'Last Updated',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    sidebar: [{
      title: 'Guide',
      children: [
        ['intro.md', '框架介绍'],
        ['data.md', 'data处理'],
        ['compile.md', 'html处理'],
        ['computed.md', 'computed处理']
      ]
    }, {
      title: '第三方',
      children: [
        ['/helper/kingx.md', 'Kingx状态管理']
      ]
    }],
  },

  plugins: {
    '@vuepress/back-to-top': true,
  }
}