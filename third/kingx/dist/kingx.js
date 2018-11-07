(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.Kingx = {})));
}(this, (function (exports) { 'use strict';

  var Store = /** @class */ (function () {
      function Store(options, King) {
          var _this = this;
          var state = options.state, getters = options.getters, mutations = options.mutations, actions = options.actions;
          var _vm = new King({
              data: function () {
                  return state;
              }
          });
          this.state = Object.create(_vm);
          this.mutations = {};
          this.actions = {};
          this.getters = {};
          if (mutations) {
              Object.keys(mutations).forEach(function (key) {
                  var mutation = mutations[key];
                  def(_this.mutations, key, mutation.bind(_this, _this.state), true);
              });
          }
          if (actions) {
              Object.keys(actions).forEach(function (key) {
                  var action = actions[key];
                  def(_this.actions, key, action.bind(_this, {
                      state: _this.state,
                      getters: _this.getters,
                      commit: _this.commit.bind(_this),
                      dispatch: _this.dispatch.bind(_this)
                  }), true);
              });
          }
      }
      Store.prototype.commit = function (type, payload) {
          var mutation = this.mutations[type];
          if (mutation) {
              mutation(payload);
          }
      };
      Store.prototype.dispatch = function (type, payload) {
          var action = this.actions[type];
          if (action) {
              action(payload);
          }
      };
      return Store;
  }());
  /**
   * 定义不可重写的方法
   * @param obj
   * @param key
   * @param val
   * @param enumerable
   */
  function def(obj, key, val, enumerable) {
      Object.defineProperty(obj, key, {
          enumerable: !!enumerable,
          configurable: false,
          writable: false,
          value: val
      });
  }

  function mapState(states, store) {
      var maps = {};
      states.forEach(function (key) {
          maps[key] = function () {
              return store.state[key];
          };
      });
      return maps;
  }

  var version = "1.0.0";

  exports.Store = Store;
  exports.version = version;
  exports.mapState = mapState;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
