# Kingx 是什么？

Kingx 是一个专为 King.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

## 使用

```js
const store = new Kingx.Store(
  {
    state: {
      count: 0
    },
    mutations: {
      increment(state) {
        state.count++;
      },
      decrement(state) {
        state.count--;
      }
    },
    actions: {
      incrementAsync({ commit }) {
        commit("increment");
      },
      decrementAsync({ commit }) {
        commit("decrement");
      }
    }
    /* 目前还不支持  */
    // getters,
    // modules,
  },
  King
);
```

```js
const { mapState } = Kingx;
const vm = new King({
  el: ".app",
  computed: {
    ...mapState(["count"], store)
  }
});
```

```html
<div class="app">
  <p>count: <span>{{ count }}</span></p>
  <button class="add-count">+</button>
  <button class="mini-count">-</button>
</div>

<script>
  // kingx count
  document.querySelector('.add-count').addEventListener('click', () => {
    store.dispatch('incrementAsync');
  });

  document.querySelector('.mini-count').addEventListener('click', () => {
    store.dispatch('decrementAsync');
  });
</script>
```
