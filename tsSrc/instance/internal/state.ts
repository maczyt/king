import { observer } from "../../observer";
import Watcher from "../../watcher";
import Dep from "../../dep";

export default function(King) {
  King.prototype._initState = function() {
    this._initData();
    this._initComputed();
  };

  King.prototype._initProps = function() {
    // 暂不实现
  };

  King.prototype._initData = function() {
    // data处理Observer化
    const options = this.$options;
    const dataFn = options.data;
    const data = (this._data = dataFn.call(this));

    // Observer 化
    observer(data, this);
    // 代理到this上去
    Object.keys(data).forEach(key => {
      this._proxy(key);
    });
  };

  King.prototype._initComputed = function() {
    // 本次只实现getter，不实现setter
    const options = this.$options;
    const computed = options.computed;

    if (computed) {
      for (let key in computed) {
        const userDef = computed[key];
        let def = {
          enumerable: true,
          configurable: true
        };

        // 本次只实现该选项
        if (typeof userDef === "function") {
          def["get"] = makeComputedGetter(userDef, this);
          def["set"] = function noop() {};
        } else {
        }

        Object.defineProperty(this, key, def);
      }
    }

    function makeComputedGetter(getter, vm) {
      let watcher = new Watcher(vm, getter, null, {
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
  King.prototype._proxy = function(key) {
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
