// mixin
import initMixin from './internal/init';
import stateMixin from './internal/state';
import lifecycleMixin from './internal/lifecycle';

// api
import lifecycleApi from './api/lifecycle';

/**
 * 内部变量和方法使用 _ 前缀
 * 公共变量和方法使用 $ 前缀
 * @param {*} options 
 */
function King(options = {}) {
  this._init(options);
}

// use mixin
initMixin(King);
stateMixin(King);
lifecycleMixin(King);

// use api
lifecycleApi(King);

export default King;