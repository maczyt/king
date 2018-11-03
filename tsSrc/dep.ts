let uid: number = 0;

class Dep implements DepIF {
  static target: WatcherIF;
  id: number;
  subs: Array<WatcherIF>;
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub: WatcherIF) {
    this.subs.push(sub);
  }

  removeSub(sub: WatcherIF) {
    this.subs.splice(this.subs.indexOf(sub) >>> 0, 1);
  }

  depend() {
    Dep.target.addDep(this);
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}

export default Dep;
