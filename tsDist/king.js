(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.King = factory());
}(this, (function () { 'use strict';

  var uid = 0;
  function initMixin (King) {
      King.prototype._init = function (options) {
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

  var uid$1 = 0;
  var Dep = /** @class */ (function () {
      function Dep() {
          this.id = uid$1++;
          this.subs = [];
      }
      Dep.prototype.addSub = function (sub) {
          this.subs.push(sub);
      };
      Dep.prototype.removeSub = function (sub) {
          this.subs.splice(this.subs.indexOf(sub) >>> 0, 1);
      };
      Dep.prototype.depend = function () {
          Dep.target.addDep(this);
      };
      Dep.prototype.notify = function () {
          this.subs.forEach(function (sub) {
              sub.update();
          });
      };
      return Dep;
  }());

  var Observer = /** @class */ (function () {
      function Observer(value) {
          this.value = value;
          this.dep = new Dep();
          if (Array.isArray(value)) ;
          else {
              this.walk(value);
          }
      }
      /* Object start */
      Observer.prototype.walk = function (obj) {
          var _this = this;
          Object.keys(obj).forEach(function (key) {
              _this.convert(_this.value, key, obj[key]);
          });
      };
      Observer.prototype.convert = function (obj, key, val) {
          defineReactive(obj, key, val);
      };
      return Observer;
  }());
  // 充当一个闭包的作用域
  function defineReactive(obj, key, val) {
      var dep = new Dep();
      var property = Object.getOwnPropertyDescriptor(obj, key);
      var getter = property && property.get;
      var setter = property && property.set;
      // 如果val是对象，也处理成Observer
      var childOb = observer(val);
      Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          get: function reactiveGetter() {
              // 获取obj上的key，这个时候会记录是谁在获取这个key，并把该订阅者存储到Dep中
              // 通过Dep.target 来记录是哪个订阅者对象，而且会把当前dep存储到订阅者上
              var value = getter ? getter.call(obj) : val;
              if (Dep.target) {
                  // 告诉Dep.target, 把该dep添加进去
                  dep.depend();
                  // 表示用到了对象
                  if (this.childOb) {
                      childOb.dep.depend();
                  }
              }
              return value;
          },
          set: function reactiveSetter(newVal) {
              // 修改了obj上的key，这个时候需要通知Dep上的订阅者，表示我这个值修改了，你了解一下
              var value = getter ? getter.call(obj) : val;
              // 表示数据没变化
              if (value === newVal)
                  return;
              if (setter) {
                  setter.call(obj, newVal);
              }
              else {
                  val = newVal;
              }
              // 通知订阅者更新
              dep.notify();
              // 需要对新数据处理成Observer
              childOb = observer(newVal);
          }
      });
  }
  function observer(value, vm) {
      if (!value || typeof value !== "object") {
          return;
      }
      var ob;
      if ("__ob__" in value && value.__ob__ instanceof Observer) {
          ob = value.__ob__;
      }
      else {
          ob = new Observer(value);
          def(value, "__ob__", ob);
      }
      return ob;
  }
  function def(obj, key, val) {
      Object.defineProperty(obj, key, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: val
      });
  }

  var uid$2 = 0;
  var Watcher = /** @class */ (function () {
      function Watcher(vm, expOrFn, cb, options) {
          this.id = uid$2++;
          this.vm = vm;
          this.deps = [];
          this.expOrFn = expOrFn;
          this.cb = cb;
          this.vm._watchers.push(this);
          if (options) {
              Object.assign(this, options);
          }
          this.dirty = this["lazy"];
          var isFn = typeof expOrFn === "function";
          if (isFn) {
              this["getter"] = expOrFn;
              this["setter"] = undefined;
          }
          else {
              this["getter"] = new Function("with(this) { return " + this.expOrFn + " }");
              this["setter"] = this["twoWay"]
                  ? new Function("value", "with(this) { " + this.expOrFn + " = value }")
                  : function noop() { };
          }
          this.value = this["lazy"] ? undefined : this.get();
      }
      Watcher.prototype.get = function () {
          this.beforeGet();
          var scope = this.vm;
          var value;
          try {
              value = this["getter"].call(scope);
          }
          catch (e) { }
          this.afterGet();
          return value;
      };
      Watcher.prototype.set = function (value) {
          var scope = this.vm;
          try {
              this["setter"].call(scope, value);
          }
          catch (e) { }
      };
      Watcher.prototype.beforeGet = function () {
          Dep.target = this;
      };
      Watcher.prototype.afterGet = function () {
          Dep.target = null;
      };
      Watcher.prototype.update = function () {
          var oldValue = this.value;
          if (this["lazy"]) {
              this.dirty = true;
          }
          else {
              this.cb.call(this.vm, this.get(), oldValue);
          }
      };
      Watcher.prototype.addDep = function (dep) {
          if (this.deps.some(function (d) {
              return d.id === dep.id;
          })) {
              return;
          }
          this.deps.push(dep);
          dep.addSub(this);
      };
      Watcher.prototype.evaluate = function () {
          // 不破坏data指向
          var current = Dep.target;
          this.value = this.get();
          // 防止再次重复执行
          this.dirty = false;
          Dep.target = current;
      };
      Watcher.prototype.depend = function () {
          this.deps.forEach(function (dep) {
              dep.depend();
          });
      };
      return Watcher;
  }());

  function stateMixin (King) {
      King.prototype._initState = function () {
          this._initData();
          this._initComputed();
      };
      King.prototype._initProps = function () {
          // 暂不实现
      };
      King.prototype._initData = function () {
          var _this = this;
          // data处理Observer化
          var options = this.$options;
          var dataFn = options.data;
          var data = (this._data = dataFn.call(this));
          // Observer 化
          observer(data, this);
          // 代理到this上去
          Object.keys(data).forEach(function (key) {
              _this._proxy(key);
          });
      };
      King.prototype._initComputed = function () {
          // 本次只实现getter，不实现setter
          var options = this.$options;
          var computed = options.computed;
          if (computed) {
              for (var key in computed) {
                  var userDef = computed[key];
                  var def = {
                      enumerable: true,
                      configurable: true
                  };
                  // 本次只实现该选项
                  if (typeof userDef === "function") {
                      def["get"] = makeComputedGetter(userDef, this);
                      def["set"] = function noop() { };
                  }
                  Object.defineProperty(this, key, def);
              }
          }
          function makeComputedGetter(getter, vm) {
              var watcher = new Watcher(vm, getter, null, {
                  lazy: true
              });
              return function computedGetter() {
                  if (watcher.dirty) {
                      watcher.evaluate();
                  }
                  if (Dep.target) {
                      watcher.depend();
                  }
                  return watcher.value;
              };
          }
      };
      /**
       * 代理访问 - 代理模式
       */
      King.prototype._proxy = function (key) {
          var self = this;
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
      bind: function () {
          this.attr = this.el.nodeType === 1 ? "textContent" : "data";
      },
      update: function (value) {
          this.el[this.attr] = value;
      }
  };

  var html = {
      bind: function () {
          this.attr = "innerHTML";
      },
      update: function (value) {
          this.el[this.attr] = value;
      }
  };
  // 只有元素节点才有

  // 双向绑定实现
  // 只实现input text
  var model = {
      bind: function () {
          var self = this;
          this.el.addEventListener("input", function (event) {
              var target = event.target;
              var value = target.value;
              self.set(value);
          }, false);
      },
      update: function (value) {
          this.el.value = value;
      }
  };

  var bind = {
      bind: function () {
          this.attr = this.bindProperty;
      },
      update: function (value) {
          if (typeof value === "object") {
              Object.assign(this.el[this.attr], value);
          }
          else {
              this.el[this.attr] = value;
          }
      }
  };

  var Dirs = {
      text: text,
      html: html,
      model: model,
      bind: bind
  };

  var Directive = /** @class */ (function () {
      function Directive(name, expOrFn, el, vm, options) {
          this.vm = vm;
          this.el = el;
          this.name = name;
          this.expOrFn = expOrFn;
          this.vm._directives.push(this);
          // bind 属性
          if (options) {
              Object.assign(this, options);
          }
          var isFn = typeof expOrFn === "function";
          var def = Dirs[name];
          if (isFn) {
              this["update"] = expOrFn;
          }
          else {
              Object.assign(this, def);
          }
      }
      Directive.prototype._bind = function () {
          if (this["bind"]) {
              this["bind"]();
          }
          if (this.el.removeAttribute) {
              this.el.removeAttribute("k-" + this.name);
          }
          if (this["update"]) {
              var self_1 = this;
              this["_update"] = function (val, oldVal) {
                  self_1["update"](val, oldVal);
              };
          }
          else {
              this["_update"] = function noop() { };
          }
          var watcher = (this._watcher = new Watcher(this.vm, this.expOrFn, this["_update"], {
              twoWay: this.name === "model"
          }));
          if (this["update"]) {
              this["update"](watcher.value);
          }
      };
      Directive.prototype.set = function (value) {
          this._watcher.set(value);
      };
      return Directive;
  }());

  function lifecycleMixin (King) {
      King.prototype._compile = function (el) {
          compileRoot(el, this);
          if (el.hasChildNodes()) {
              compileNodeList(el.childNodes, this);
          }
      };
  }
  function compileRoot(el, vm) {
      compileNode(el, vm);
  }
  function compileNodeList(nodeList, vm) {
      toArray(nodeList).forEach(function (node) {
          if (node.nodeType === 1 &&
              node["tagName"] !== "SCRIPT" &&
              node.hasChildNodes()) {
              compileNodeList(node.childNodes, vm);
          }
          // 编译当前节点要在子节点编译后，深度优先
          // 不然编译元素节点，会把文本填进去，导致又生成文本节点.
          compileNode(node, vm);
      });
  }
  function compileNode(node, vm) {
      var type = node.nodeType;
      if (type === 1 && node.tagName !== "SCRIPT") {
          compileElement(node, vm);
      }
      else if (type === 3 && node.data.trim()) {
          compileTextNode(node, vm);
      }
  }
  function compileElement(el, vm) {
      var attrs = el.attributes;
      parseDirectives(attrs, el, vm);
  }
  function compileTextNode(textNode, vm) {
      var textRE = /\{\{([^}]+)\}\}/;
      var data = textNode.data;
      var matched;
      var dirName = "text";
      var expression;
      var dir;
      if ((matched = data.match(textRE))) {
          expression = matched[1].trim();
          dir = new Directive(dirName, expression, textNode, vm);
      }
      if (dir) {
          dir._bind();
      }
  }
  function parseDirectives(attrs, el, vm) {
      var dirRE = /k-([^.:]+)/;
      var bindRE = /^:([^.:]+)/;
      var dir;
      var dirs = [];
      var name;
      var expression;
      var dirName;
      var matched;
      toArray(attrs).forEach(function (attr) {
          name = attr.name;
          expression = attr.value;
          if ((matched = name.match(dirRE))) {
              // 匹配到指令
              dirName = matched[1];
              dir = new Directive(dirName, expression, el, vm);
              dirs.push(dir);
          }
          else if ((matched = name.match(bindRE))) {
              var bindProperty_1 = matched[1];
              dirName = "bind";
              var exp = expression;
              var fn_1 = new Function("return " + expression);
              try {
                  expression = fn_1.call(vm);
              }
              catch (e) {
                  expression = exp;
              }
              var bindUpdate = void 0;
              el.removeAttribute(":" + bindProperty_1);
              if (typeof expression === "object") {
                  bindUpdate = function () {
                      var obj = fn_1.call(vm);
                      Object.keys(obj).forEach(function (key) {
                          el[bindProperty_1][key] = obj[key];
                      });
                  };
              }
              dir = new Directive(dirName, typeof expression === "object" ? bindUpdate : exp, el, vm, {
                  bindProperty: bindProperty_1
              });
              dirs.push(dir);
          }
      });
      dirs.forEach(function (dir) {
          dir._bind();
      });
  }
  function toArray(arr) {
      var i = arr.length;
      var res = [];
      while (i--) {
          res[i] = arr[i];
      }
      return res;
  }

  function lifecycleApi (King) {
      King.prototype.$mount = function (el) {
          el = typeof el === "string" ? document.querySelector(el) : el;
          this.el = el;
          // 编译模板，解析出指令和{{}}渲染的文本
          this._compile(el);
      };
  }

  var King = /** @class */ (function () {
      function King(options) {
          this["_init"](options);
      }
      return King;
  }());
  // use mixins
  initMixin(King);
  stateMixin(King);
  lifecycleMixin(King);
  // use apis
  lifecycleApi(King);

  King.version = "1.0.0";

  return King;

})));
