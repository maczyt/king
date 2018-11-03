export default function(King) {
  King.prototype.$mount = function(el) {
    el = typeof el === "string" ? document.querySelector(el) : el;
    this.el = el;
    // 编译模板，解析出指令和{{}}渲染的文本
    this._compile(el);
  };
}
