const vm = new King({
  el: ".app",
  data() {
    return {
      name: 'zyt',
      age: 25,
    }
  },
  computed: {
    user() {
      return `My name is ${this.name}, age is ${this.age}`;
    }
  }
})