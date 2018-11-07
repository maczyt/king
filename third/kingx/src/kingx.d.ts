/**
 * Store 构造接口
 */
interface StoreIF {
  state: object;
  getters: object;
  mutations: object;
  actions: object;
  // 暂不实现
  modules?: object;
}
