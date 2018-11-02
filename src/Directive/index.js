import Dirs from './dirs/index';
import Watcher from '../watcher/index';

function Directive(name, expOrFn, el, vm) {
  this.el = el;
  this.vm = vm;
  this.name = name;
  this.expOrFn = expOrFn;
  this.vm._directives.push(this);
}


Directive.prototype._bind = function () {
  const name = this.name;
  const def = Dirs[name];

  if (typeof def === 'function') {
    this.update = def;
  } else {
    Object.assign(this, def);
  }

  if (this.bind) {
    this.bind();
  }

  if (this.update) {
    const self = this;
    this._update = function (val, oldVal) {
      self.update(val, oldVal);
    }
  } else {
    this._update = function noop() {}
  }

  const watcher = this._watcher = new Watcher(this.vm, this.expOrFn, this._update);

  if (this.update) {
    this.update(watcher.value);
  }
};

export default Directive;