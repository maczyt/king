export default function (King) {
  King.prototype.$mount = function (el) {
    el = typeof el === 'string' ? document.querySelector(el) : el;
    this._compile(el);
  };
}