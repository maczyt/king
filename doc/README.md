# King 源码分析

> 来大华已有 10 个月之余，来之后一直使用`vue.js`全家桶干活，对于平常出现的 bug 基本已达到了 90%可以很快解决，加上组里同事的捧场(**涛神**)，个人虚荣心得到很大的满足，但是我知道自己还有很多的不足，秉着考察自己对`vue.js`的掌握+为组里小伙伴送点福利的，准备了本次分享，希望在场的能有所收获(没来的就不管了 😕)

::: tip 需要提前准备的知识点

1. `Object.defineProperty` (Vue3 使用 ES6 的 Proxy 重写)
2. DOM 节点的相关知识: nodeType、tagName、attributes、childNodes 文本节点、元素节点、注释节点
3. 设计模式
   - 发布订阅者(观察者)
   - 代理

:::

## 讲解风格

::: warning 背景(现状)
目前市面上已有很多关于讲解 Vue.js 源码的文章和教程，相信看过的，都会知道数据的双向绑定原理，但经常到这里就结束了，想知道更多就没了~

或者对每个知识都讲一点，这样又没法连起来，导致我们无法看到实现的例子，从而迷失在“浩瀚”的代码中，选择放弃。
:::

::: tip 我的方式
我将按着构造函数一步一步讲解，照着讲解编写出属于我们的`MVVM`框架。当然是阉割版的，毕竟完整版我也不会 😄
:::

## 要实现的代码

```html
<div class="app">
  <p k-text="name"></p>
  <p k-text="age"></p>
  <p k-text="user"></p>
</div>
```

```js
const vm = new King({
  el: ".app",
  data() {
    return {
      name: "zyt",
      age: 25
    };
  },
  computed: {
    user() {
      return `My name is ${this.name}, age is ${this.age}`;
    }
  }
});
```

当我们调用`new King()`，King 会:

1. 初始实例状态
2. 编译 html，解析指令

|         初始状态         |                   编译 html                    |
| :----------------------: | :--------------------------------------------: |
| ~~props: 父子组件 prop~~ | 深度优先遍历 DOM，识别指令或者`{{}}`渲染的文本 |
|           data           |                                                |
|         computed         |                                                |

由于不打算讲解父子组件，所以把 props 略过，让我们从 data 开始吧，先大致看下`Schema`

```ts
/* Obserber start */

interface ObserverIF {
  value: any;
  dep: DepIF;
  // observer obj
  walk(obj: object);
  // observer obj key
  convert(obj: object, key: string, val);
}

/* Obserber end */

/* Dep start */
// 发布者
interface DepIF {
  subs: Array<WatcherIF>;
  id: number;
  // 添加订阅者
  addSub(sub);
  // 删除订阅者
  removeSub(sub);
  // 告诉当前订阅者可以把我添加到你订阅的列表中
  depend();
  // 通知订阅者更新吧
  notify();
}
/* Dep end */

/* Watcher start */
// 订阅者
interface WatcherIF {
  // 绑定的expression值
  value: any;
  expOrFn: Function | String;
  vm: KingIF;
  // 指令绑定的回调函数
  cb: Function;
  deps: Array<DepIF>;
  // 订阅者更新
  update();
  // 添加发布者
  addDep(dep);
  beforeGet();
  get();
  afterGet();
  set(value);
  evaluate();
  depend();
}
/* Watcher end */

/* Directive start */
// 指令
interface DirectiveIF {
  vm: KingIF;
  el: any;
  name: string;
  _watcher: WatcherIF;
  _bind();
  // _update(val, oldVal);
}
/* Directive end */

/* King start */
interface KingIF {
  id: number;
  el: Node;
  /* 内部属性 start */
  _data: object;
  // 收集当前组件watcher
  _watchers: Array<WatcherIF>;
  // 收集当前组件directive
  _directives: Array<DirectiveIF>;
  /* 内部属性 end */

  /* 公共属性 start */
  $options: object;
  /* 公共属性 end */
}
/* King end */
```
