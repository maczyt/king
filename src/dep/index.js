let uid = 0;

// 数据依赖 - 发布者 <-> watcher(订阅者)
function Dep() {
  this.id = uid++;
  // 存储订阅者
  this.subs = [];
}

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function (sub) {
  this.subs.splice(this.subs.indexOf(sub) >>> 0, 1);
};

// 管理依赖的数据被watcher，把该依赖添加到订阅者身上
Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

// 依赖的数据发生变化，通知订阅者更新
Dep.prototype.notify = function () {
  this.subs.forEach(sub => {
    sub.update();
  })
};

Dep.target = null;

export default Dep;