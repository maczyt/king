import Dep from "./dep";

let uid: number = 0;
class Watcher implements WatcherIF {
  id: number;
  value: any;
  expOrFn: any;
  vm: KingIF;
  cb: Function;
  deps: Array<DepIF>;
  dirty: Boolean;
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
    this.dirty = this["lazy"];
    const isFn = typeof expOrFn === "function";
    if (isFn) {
      this["getter"] = expOrFn;
      this["setter"] = undefined;
    } else {
      this["getter"] = new Function(`with(this) { return ${this.expOrFn} }`);
      this["setter"] = this["twoWay"]
        ? new Function("value", `with(this) { ${this.expOrFn} = value }`)
        : function noop() {};
    }

    this.value = this["lazy"] ? undefined : this.get();
  }

  get() {
    this.beforeGet();
    const scope = this.vm;
    let value;
    try {
      value = this["getter"].call(scope);
    } catch (e) {}
    this.afterGet();
    return value;
  }

  set(value) {
    const scope = this.vm;
    try {
      this["setter"].call(scope, value);
    } catch (e) {}
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
      this.dirty = true;
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

  evaluate() {
    // 不破坏data指向
    const current = Dep.target;
    this.value = this.get();
    // 防止再次重复执行
    this.dirty = false;
    Dep.target = current;
  }

  depend() {
    this.deps.forEach(dep => {
      dep.depend();
    });
  }
}

export default Watcher;
