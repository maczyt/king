# Data 处理

```js{3-8}
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

上面高亮处即是我们需要处理的`data`数据，怎么处理呢？要处理成怎么样呢？

在 vue 中，当我们修改数据，页面即会发生更新，并且页面也可以使用 input 通过 v-model 来修改 data
所以我们需要 data 数据处理成能检测变化的(也称可观察的)

## 具体过程

1. 首先我们创建 observer.js 文件(模块化，避免代码文件过多，最后我们将用 rollup 打包)
2. observer.js 代码, 我将用 typescript 来表现，为了表示类型

```ts
export function Observer(value) {}

export function observer(value, vm): Observer {
  // 如果所要处理的数据不是对象则直接返回，因为Object.defineProperty是针对对象的
  // 这里不会展开数组，对数组感兴趣的可以自己实现
  if (!value || !isObject(value)) {
    return;
  }
  let ob: Observer;
  // 如果数据已经被处理过了，那直接返回Observer
  if ("__ob__" in value && value.__ob__ instanceof Observer) {
  }
}
```
