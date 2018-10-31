let uid = 0;

export default function (King) {
  King.prototype._init = function (options) {
    // options配置存储起来
    this.$options = options;
    // mount的元素
    this.$el = null;
    // 编号
    this.id = uid++;
    // 存储订阅者
    this._watchers = [];
    // 存储指令
    this._directives = [];
    // 是King实例对象
    this._isKing = true;

    // 数据存储
    this._data = null;

    // 初始化
    // props、meta、methods、data、computed
    this._initState();

    // 初始化
    // watch、on
    // 暂不实现
    // this._initEvent();

    if (options.el) {
      this.$mount(options.el);
    }
  };
}