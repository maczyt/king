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
  if (!value || typeof value !== "object") {
    return;
  }
  let ob: ObserverIF;
  if ("__ob__" in value && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
    def(value, "__ob__", ob);
  }

  if (ob && vm) {
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
