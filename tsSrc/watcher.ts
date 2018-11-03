import Dep from "./dep";

let uid: number = 0;
class Watcher implements WatcherIF {
  id: number;
  value: any;
  expOrFn: any;
  vm: KingIF;
  cb: Function;
  deps: Array<DepIF>;
  constructor(vm, expOrFn, cb, options?) {
    this.id = uid++;
    this.vm = vm;
    this.deps = [];
    this.expOrFn = expOrFn;
    this.cb = cb;
    this.vm._watchers.push(this);
    if (options) {
      Object.assign(this, options);
    }

    this.value = this["lazy"] ? undefined : this.get();
  }

  get() {
    this.beforeGet();
    const isFn = typeof this.expOrFn === "function";
    const scope = this.vm;
    let value = isFn
      ? this.expOrFn.call(scope)
      : new Function(`with(this) { return ${this.expOrFn} }`).call(scope);
    this.afterGet();
    return value;
  }

  beforeGet() {
    Dep.target = this;
  }

  afterGet() {
    Dep.target = null;
  }

  update() {
    let oldValue = this.value;
    if (this["lazy"]) {
    } else {
      this.cb.call(this.vm, this.get(), oldValue);
    }
  }

  addDep(dep) {
    if (
      this.deps.some(d => {
        return d.id === dep.id;
      })
    ) {
      return;
    }
    this.deps.push(dep);
    dep.addSub(this);
  }
}

export default Watcher;
