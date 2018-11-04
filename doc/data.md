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
import Dep from "./dep";

export class Observer implements ObserverIF {
  value: any;
  dep: DepIF;
  constructor(value) {
    this.value = value;
    this.dep = new Dep();

    if (Array.isArray(value)) {
      // Observer array
    } else {
      this.walk(value);
    }
  }
  /* Object start */
  walk(obj: object) {
    Object.keys(obj).forEach(key => {
      this.convert(this.value, key, obj[key]);
    });
  }

  convert(obj: object, key: string, val: any) {
    defineReactive(obj, key, val);
  }
  /* Object end */
}

// 充当一个闭包的作用域
function defineReactive(obj: object, key: string, val: any) {
  let dep = new Dep();
  const property = Object.getOwnPropertyDescriptor(obj, key);
  const getter = property && property.get;
  const setter = property && property.set;
  // 如果val是对象，也处理成Observer
  let childOb = observer(val);
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: function reactiveGetter() {
      // 获取obj上的key，这个时候会记录是谁在获取这个key，并把该订阅者存储到Dep中
      // 通过Dep.target 来记录是哪个订阅者对象，而且会把当前dep存储到订阅者上
      let value = getter ? getter.call(obj) : val;
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
      let value = getter ? getter.call(obj) : val;
      // 表示数据没变化
      if (value === newVal) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      // 通知订阅者更新
      dep.notify();
      // 需要对新数据处理成Observer
      childOb = observer(newVal);
    }
  });
}

export function observer(value, vm?: KingIF): ObserverIF {
  // 如果所要处理的数据不是对象则直接返回，因为Object.defineProperty是针对对象的
  // 这里不会展开数组，对数组感兴趣的可以自己实现
  if (!value || typeof value !== "object") {
    return;
  }
  let ob: ObserverIF;
  // 如果已经Observer化，则直接返回
  if ("__ob__" in value && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
    // 存储起来便于判断已Observer化，防止下次又进行Observer化处理
    def(value, "__ob__", ob);
  }

  if (ob && vm) {
  }

  return ob;
}

/**
 * 由于定义到数据上，之后要对数据 Object.defineProperty处理
 * 所以该绑定的数据不可枚举
 */
function def(obj, key, val) {
  Object.defineProperty(obj, key, {
    enumerable: false,
    configurable: false,
    writable: false,
    value: val
  });
}
```

## 简单说一下

当我们`new King()`的时候，传进去 data 如果有，就会调用`observer(data, vm)`，使得数据改变能被我们所拦截，而数据发生改变，我们如果需要
一些操作，在这里我们借助了`Dep`，然后如果有地方用到了该数据，则把这个地方注册到`Dep`中的存储列表去，只要数据发生改变，就会遍历当前`Dep`的存储列表，告诉需要用到该数据的地方，数据发生改变了。

> 就好比：数据就是某个新闻邮局，小周和小张都想了解，那么不可能小周和小张每隔多少时间去一趟邮局看看是不是更新了，所以邮局推出了邮箱功能，而小周和小张则只需订阅该邮箱，只要邮局发生更新，则去通知订阅列表告诉他们邮局有更新，请执行你们的动作。

所以`Dep`在这里便是邮箱的功能，让我们看下`Dep`代码:

```ts
let uid: number = 0;

class Dep implements DepIF {
  static target: WatcherIF;
  // id可以说是国家给的规定，每个邮箱需要有自己的unique id，以防出现重复邮箱
  id: number;
  // 存储订阅者
  subs: Array<WatcherIF>;
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  // 如果有小傅也需要订阅，则调用邮箱的这个方法，把小傅也加进来
  addSub(sub: WatcherIF) {
    this.subs.push(sub);
  }

  // 如果小周对该邮箱不感兴趣了，也可以通过该方法，把自己取消订阅
  removeSub(sub: WatcherIF) {
    this.subs.splice(this.subs.indexOf(sub) >>> 0, 1);
  }

  // 相当于小周如果订阅了该邮箱，则该邮箱会告诉小周，这个时候小周会把该邮箱添加到自己的列表
  // 因为小周可能订阅了多个邮箱，也是需要管理的
  depend() {
    Dep.target.addDep(this);
  }

  // 邮箱更新，通知这些订阅者
  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}
export default Dep;
```

代码不多，看起来也非常好理解

## 小结

这个时候我们数据也是`Observer`化了，也有了通知更新的`Dep`(可以称为**发布者**)，那我们现在缺少的就是订阅者了，订阅者我们使用了`Watcher`来表示，`Watcher`如何判断需要订阅哪些数据呢？

所以我们需要开始对`html`进行解析，对`html`中的`k-`开始的指令以及`{{}}`的文本进行编译解析
