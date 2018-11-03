import Dirs from "./directives/index";
import Watcher from "./watcher";

class Directive implements DirectiveIF {
  vm: KingIF;
  el: any;
  _watcher: WatcherIF;
  name: string;
  expOrFn: any;
  constructor(name, expOrFn, el, vm) {
    this.vm = vm;
    this.el = el;
    this.name = name;
    this.expOrFn = expOrFn;
    this.vm._directives.push(this);

    const isFn = typeof expOrFn === "function";

    const def = Dirs[name];

    if (isFn) {
      this["update"] = expOrFn;
    } else {
      Object.assign(this, def);
    }
  }

  _bind() {
    if (this["bind"]) {
      this["bind"]();
    }

    if (this.el.removeAttribute) {
      this.el.removeAttribute(`k-${this.name}`);
    }

    if (this["update"]) {
      const self = this;
      this["_update"] = function(val, oldVal) {
        self["update"](val, oldVal);
      };
    } else {
      this["_update"] = function noop() {};
    }
    const watcher = (this._watcher = new Watcher(
      this.vm,
      this.expOrFn,
      this["_update"],
      {
        twoWay: this.name === "model"
      }
    ));
    if (this["update"]) {
      this["update"](watcher.value);
    }
  }

  set(value) {
    this._watcher.set(value);
  }
}

export default Directive;
