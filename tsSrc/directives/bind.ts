export default {
  bind() {
    this.attr = this.bindProperty;
  },
  update(value) {
    if (typeof value === "object") {
      Object.assign(this.el[this.attr], value);
    } else {
      this.el[this.attr] = value;
    }
  }
};
