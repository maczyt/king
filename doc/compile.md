# html 处理

```html
<div class="app">
  <p k-text="name"></p>
  <p k-text="age"></p>
  <p k-text="user"></p>
</div>
```

在`new King()`的时候，我们会传入`el`字段(是一个选择器)，来告诉框架我需要解析编译哪些`html`。

## 具体过程

首先我们会通过`el`获取元素(不传`el`和`Fragment`的情况这里不做讨论)，并对该元素进行深度优先遍历，对有`{{}}`的文本节点和有`k-*`指令属性的元素节点编译解析.

```ts
import Directive from "../../directive";

export default function(King) {
  King.prototype._compile = function(el: HTMLElement) {
    if (el.hasChildNodes()) {
      compileNodeList(el.childNodes, this);
    }
    // 深度优先
    compileRoot(el, this);
  };
}

function compileRoot(el, vm) {
  compileNode(el, vm);
}

function compileNodeList(nodeList: NodeList, vm) {
  Array.from(nodeList).forEach(node => {
    if (
      node.nodeType === 1 &&
      node["tagName"] !== "SCRIPT" &&
      node.hasChildNodes()
    ) {
      compileNodeList(node.childNodes, vm);
    }
    // 编译当前节点要在子节点编译后，深度优先
    // 不然编译元素节点，会把文本填进去，导致又生成文本节点.
    compileNode(node, vm);
  });
}

function compileNode(node, vm) {
  const type = node.nodeType;
  if (type === 1 && node.tagName !== "SCRIPT") {
    compileElement(node, vm);
  } else if (type === 3 && node.data.trim()) {
    compileTextNode(node, vm);
  }
}

// 当前是元素节点，对元素上的属性遍历解析，看是否有指令
function compileElement(el, vm) {
  let attrs = el.attributes;
  parseDirectives(attrs, el, vm);
}
// 当前是文本节点，解析是否含有{{}}
function compileTextNode(textNode, vm) {
  const textRE = /\{\{([^}]+)\}\}/;
  const data = textNode.data;
  let matched;
  let dirName = "text";
  let expression;
  let dir;
  if ((matched = data.match(textRE))) {
    expression = matched[1].trim();
    dir = new Directive(dirName, expression, textNode, vm);
  }
  if (dir) {
    dir._bind();
  }
}

function parseDirectives(attrs, el, vm: KingIF) {
  const dirRE = /k-([^.:]+)/;
  const bindRE = /^:([^.:]+)/; // :value :style :class
  let dir;
  let dirs = [];
  let name;
  let expression;
  let dirName;
  let matched;
  Array.from(attrs).forEach(attr => {
    name = attr.name;
    expression = attr.value;

    if ((matched = name.match(dirRE))) {
      // 匹配到指令
      dirName = matched[1];
      dir = new Directive(dirName, expression, el, vm);
      dirs.push(dir);
    } else if ((matched = name.match(bindRE))) {
      const bindProperty = matched[1];
      dirName = "bind";
      const exp = expression;
      const fn = new Function(`return ${expression}`);
      try {
        expression = fn.call(vm);
      } catch (e) {
        expression = exp;
      }
      let bindUpdate;
      el.removeAttribute(`:${bindProperty}`);
      if (typeof expression === "object") {
        bindUpdate = function() {
          let obj = fn.call(vm);
          Object.keys(obj).forEach(key => {
            el[bindProperty][key] = obj[key];
          });
        };
      } else {
        // bind 指令处理
      }
      dir = new Directive(
        dirName,
        typeof expression === "object" ? bindUpdate : exp,
        el,
        vm,
        {
          bindProperty
        }
      );
      dirs.push(dir);
    }
  });

  dirs.forEach(dir => {
    dir._bind();
  });
}
```

当我们遍历元素和文本时候，找到匹配的，我们会对每个匹配到的`new Directive`， 使用`Directive`来管理。

## Directive 指令

::: danger 重点
可以说没有指令，我们数据`Observer`化，一点屁用都没有
:::

::: tip 知识点
指令非常重要的一点就是获取数据值，并把数据值绑定到节点上。

其实可以把指令直接作为订阅者，去订阅数据，只要数据改变了，然后去更新节点。

但是为了实现`computed`等功能和代码模块化，我们使用`Watcher`来充当订阅者

那现在思路就很清楚了，说明`Directive`需要和`Watcher`绑定，`Watcher`更新了，由`Watcher`去更新`Directive`
:::

```ts
import Dirs from "./directives/index";
import Watcher from "./watcher";

class Directive implements DirectiveIF {
  vm: KingIF;
  el: any;
  // 绑定Watcher
  _watcher: WatcherIF;
  name: string;
  expOrFn: any;
  constructor(name, expOrFn, el, vm, options?) {
    this.vm = vm;
    this.el = el;
    this.name = name;
    this.expOrFn = expOrFn;
    this.vm._directives.push(this);

    // bind 属性
    if (options) {
      Object.assign(this, options);
    }

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
    // 把update函数传给Watcher，如果Watcher更新了，则把值返回回来，通过调用update
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
```

## Watcher 订阅者

::: tip 知识点
`Watcher`订阅`Dep`，当`Dep`所绑定的数据发生更新，则通知`Watcher`(触发`Watcher`的`update`)，`Watcher`触发`update`，会调用表达式的值，并把新值和旧值传给绑定了`Watcher`的(比如指令或者 `Watcher`)
:::

```ts
import Dep from "./dep";

let uid: number = 0;
class Watcher implements WatcherIF {
  id: number;
  // 存储表达式值，为了新值来了后有旧值
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

  // 获取表达式值
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
    // 这里会调用数据的getter
    // 并把该Watcher与当前Dep绑定
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
```

::: danger 未完
头痛，不知道该写什么!
巴拉巴拉~~
:::
