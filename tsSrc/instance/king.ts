import initMixin from "./internal/init";
import stateMixin from "./internal/state";
import lifecycleMixin from "./internal/lifecycle";

import lifecycleApi from "./api/lifecycle";

class King implements KingIF {
  static version: string;
  id: number;
  el: Node;
  _data: object;
  _directives: Array<DirectiveIF>;
  _watchers: Array<WatcherIF>;
  $options: object;
  constructor(options: object) {
    this["_init"](options);
  }
}

// use mixins
initMixin(King);
stateMixin(King);
lifecycleMixin(King);

// use apis
lifecycleApi(King);

export default King;
