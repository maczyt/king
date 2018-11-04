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
