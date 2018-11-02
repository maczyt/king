export default {
  bind() {
    this.attr = this.el.nodeType === 1 ? 'textContent' : 'data';
  },
  update(value) {
    this.el[this.attr] = value;
  }
}