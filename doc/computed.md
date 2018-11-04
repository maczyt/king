# computed 处理

```js{9-13}
const vm = new King({
  el: ".app",
  data() {
    return {
      name: "zyt",
      age: 25
    };
  },
  computed: {
    user() {
      return `My name is ${this.name}, age is ${this.age}`;
    }
  }
});
```

和对`data`处理类似，我们使用`for in`遍历处理(这里不实现`{ get, set }`方式)，可以知道每一项都是一个`Function`

并且会把`user`绑定到`vm`上，这样解析到指令的表达式为`user`时，会触发`user`的`getter`

我们使用`Watcher`来进行处理，而表达式就是该`Function`，当执行表达式的时候，会去触发数据的`getter`，这个时候把该`Watcher`与当前 Dep 绑定，
所以如果`name`或`age`改变，也会通知`user`，从而去通知与`user`绑定指令去更新
`

::: warning 随便一说 😂
说实话这里不太好说清楚，还是等我来细细为大家呈现吧
:::
