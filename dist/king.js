(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.King = factory());
}(this, (function () { 'use strict';

  let uid = 0;

  function initMixin (King) {
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

  let uid$1 = 0;

  // 数据依赖 - 发布者 <-> watcher(订阅者)
  function Dep() {
    this.id = uid$1++;
    // 存储订阅者
    this.subs = [];
  }

  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function (sub) {
    this.subs.splice(this.subs.indexOf(sub) >>> 0, 1);
  };

  // 管理依赖的数据被watcher，把该依赖添加到订阅者身上
  Dep.prototype.depend = function () {
    Dep.target.addDep(this);
  };

  // 依赖的数据发生变化，通知订阅者更新
  Dep.prototype.notify = function () {
    this.subs.forEach(sub => {
      sub.update();
    });
  };

  Dep.target = null;

  // dep
  function Observer(value) {
    this.value = value;
    Object.defineProperty(value, '__ob__', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: this,
    });
    if (Array.isArray(value)) ; else {
      // 支持对象
      this.walk(value);
    }
  }

  Observer.prototype.walk = function (obj) {
    Object.keys(obj).forEach(key => {
      this.convert(key, obj[key]);
    });
  };

  Observer.prototype.convert = function (key, val) {
    defineReactive(this.value, key, val);
  };

  function defineReactive(obj, key, val) {
    let dep = new Dep();
    let property = Object.getOwnPropertyDescriptor(obj, key);

    let getter = property && property.get;
    let setter = property && property.set;

    let childOb = observer(val);
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get: function reactiveGetter() {
        if (Dep.target) {
          dep.depend();
        }
        return getter ? getter.call(obj) : val;
      },
      set: function reactiveSetter(newVal) {
        let value = getter ? getter.call(obj) : val;
        if (newVal === value) {
          return;
        }

        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = observer(newVal);
        dep.notify();
      }
    });
  }

  function observer(value, vm) {
    if (value && typeof value !== 'object') {
      return;
    }
    let ob;
    if ('__ob__' in value && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else {
      ob = new Observer(value);
    }

    // if (ob && vm) {
    //   ob.addVm(vm);
    // }
    return ob;
  }

  function stateMixin (King) {
    King.prototype._initState = function () {
      this._initData();
      this._initComputed();
      // 可以得知computed的优先级是高于data的
    };

    King.prototype._initData = function () {
      const options = this.$options;
      const dataFn = options.data;
      const data = this._data = dataFn.call(this);

      // Object defineProperty data
      observer(data, this);
      // 代理一波
      Object.keys(data).forEach(key => {
        this._proxy(key);
      });
    };

    King.prototype._initComputed = function () {
      const options = this.$options;
    };

    King.prototype._proxy = function (key) {
      const self = this;
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(newVal) {
          self._data[key] = newVal;
        }
      });
    };
  }

  var text = {
    bind() {
      this.attr = this.el.nodeType === 1 ? 'textContent' : 'data';
    },
    update(value) {
      this.el[this.attr] = value;
    }
  };

  var Dirs = {
    text
  };

  let uid$2 = 0;

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
    this.id = uid$2++;
    this.deps = [];

    this.vm._watchers.push(this);

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
        d.id === dep.id;
      })) ; else {
      this.deps.push(dep);
      dep.addSub(this);
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

  function Directive(name, expOrFn, el, vm) {
    this.el = el;
    this.vm = vm;
    this.name = name;
    this.expOrFn = expOrFn;
    this.vm._directives.push(this);
    // this.update()
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
      };
    } else {
      this._update = function noop() {};
    }

    const watcher = this._watcher = new Watcher(this.vm, this.expOrFn, this._update);

    if (this.update) {
      this.update(watcher.value);
    }
  };

  const dirRE = /^k-([^.:]+)/;

  function lifecycleMixin (King) {
    King.prototype._compile = function (el) {
      compileRoot(el, this);
    };
  }

  function compileNode(node, vm) {
    const type = node.nodeType;
    if (type === 1 && node.tagName !== 'SCRIPT') {
      return compileElement(node, vm);
    } else if (type === 3 && node.data.trim()) {
      return compileTextNode(node, vm);
    }
  }

  function compileRoot(el, vm) {
    compileNode(el, vm);
    compileNodeList(el.childNodes, vm);
  }

  function compileNodeList(nodeList, vm) {
    Array.from(nodeList).forEach(node => {
      compileNode(node, vm);
      if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.hasChildNodes()) {
        compileNodeList(node.childNodes, vm);
      }
    });
  }

  function compileElement(el, vm) {
    const attrs = Array.from(el.attributes);

    let name;
    let value;
    let expression;
    let dirName;
    let dirs = [];
    let dir;
    attrs.forEach(attr => {
      name = attr.name;
      value = attr.value;
      expression = value;
      if (name.match(dirRE)) {
        dirName = name.match(dirRE)[1];
        dir = new Directive(dirName, expression, el, vm);
        dirs.push(dir);
      }
    });

    if (dirs.length) {
      dirs.forEach(dir => {
        dir._bind();
      });
    }
  }

  function compileTextNode(node, vm) {
    console.log('compile text node');
  }

  function lifecycleApi (King) {
    King.prototype.$mount = function (el) {
      el = typeof el === 'string' ? document.querySelector(el) : el;
      this._compile(el);
    };
  }

  // mixin

  /**
   * 内部变量和方法使用 _ 前缀
   * 公共变量和方法使用 $ 前缀
   * @param {*} options 
   */
  function King(options = {}) {
    this._init(options);
  }

  // use mixin
  initMixin(King);
  stateMixin(King);
  lifecycleMixin(King);

  // use api
  lifecycleApi(King);

  King.version = '1.0.0';

  return King;

})));
