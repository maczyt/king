import {
  observer
} from '../../observer/index';

export default function (King) {
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
    })
  };
}