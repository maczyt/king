class Store implements StoreIF {
  state: object;
  getters: object;
  mutations: object;
  actions: object;

  constructor(options, King) {
    const { state, getters, mutations, actions } = options;
    const _vm = new King({
      data() {
        return state;
      }
    });
    this.state = Object.create(_vm);
    this.mutations = {};
    this.actions = {};
    this.getters = {};

    if (mutations) {
      Object.keys(mutations).forEach(key => {
        const mutation = mutations[key];
        def(this.mutations, key, mutation.bind(this, this.state), true);
      });
    }
    if (actions) {
      Object.keys(actions).forEach(key => {
        const action = actions[key];
        def(
          this.actions,
          key,
          action.bind(this, {
            state: this.state,
            getters: this.getters,
            commit: this.commit.bind(this),
            dispatch: this.dispatch.bind(this)
          }),
          true
        );
      });
    }
  }

  commit(type, payload) {
    const mutation = this.mutations[type];
    if (mutation) {
      mutation(payload);
    }
  }

  dispatch(type, payload) {
    const action = this.actions[type];
    if (action) {
      action(payload);
    }
  }
}

/**
 * 定义不可重写的方法
 * @param obj
 * @param key
 * @param val
 * @param enumerable
 */
function def(obj, key, val, enumerable?) {
  Object.defineProperty(obj, key, {
    enumerable: !!enumerable,
    configurable: false,
    writable: false,
    value: val
  });
}

export default Store;
