let uid: number = 0;

export default function(King) {
  King.prototype._init = function(options) {
    this.el = null;
    this.id = uid++;
    this.$options = options;
    this._directives = [];
    this._watchers = [];

    this._initState();

    if (options.el) {
      // 编译挂载
      this.$mount(options.el);
    }
  };
}
