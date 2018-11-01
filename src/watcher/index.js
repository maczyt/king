import Dep from '../dep/index';

let uid = 0;

/**
 * 
 * @param {*} vm 
 * @param {*} expOrFn 
 * @param {*} cb : 指令注册的回调函数 
 * @param {*} options 
 */
function Watcher(vm, expOrFn, cb, options) {
  if (options) {
    Object.assign(this, options);
  }
  const isFn = typeof expOrFn === 'function';
  this.vm = vm;
  this.expression = expOrFn;
  this.cb = cb;
  this.id = uid++;
  this.deps = [];

  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    this.getter = new Function(`with(this) { return ${expOrFn} }`);
    this.setter = undefined;
  }

  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype.get = function () {
  this.beforeGet();
  let value;
  const scope = this.vm;
  try {
    value = this.getter.call(scope);
  } catch (e) {}
  this.afterGet();
  return value;
};

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
};

Watcher.prototype.afterGet = function () {
  Dep.target = null;
};

Watcher.prototype.addDep = function (dep) {
  if (this.deps.some(d => {
      d.id === dep.id
    })) {
    // 已添加了
  } else {
    this.deps.push(dep);
  }
};

Watcher.prototype.update = function () {
  const oldVal = this.value;
  let value = this.get();
  if (oldVal === value) {
    return;
  }
  this.value = value;
  this.cb.call(this.vm, value, oldVal);
};

export default Watcher;