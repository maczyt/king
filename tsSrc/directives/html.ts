export default {
  bind() {
    this.attr = "innerHTML";
  },
  update(value) {
    this.el[this.attr] = value;
  }
};

// 只有元素节点才有
