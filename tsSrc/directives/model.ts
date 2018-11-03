// 双向绑定实现

// 只实现input text
export default {
  bind() {
    const self = this;
    this.el.addEventListener(
      "input",
      function(event) {
        const target = event.target;
        const value = target.value;
        self.set(value);
      },
      false
    );
  },
  update(value) {
    this.el.value = value;
  }
};
