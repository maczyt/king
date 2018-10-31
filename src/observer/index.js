// dep
import Dep from '../dep/index';
export function Observer(value) {
  this.value = value;
  Object.defineProperty(value, '__ob__', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: this,
  });
  if (Array.isArray(value)) {
    // 暂不支持数组
  } else {
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
        console.log(Dep.target);
      }
      return getter ? getter.call(obj) : val;
    },
    set: function reactiveSetter(newVal) {
      let value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }

      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal;
      }
      childOb = observer(newVal);
      dep.notify();
    }
  })
}

export function observer(value, vm) {
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