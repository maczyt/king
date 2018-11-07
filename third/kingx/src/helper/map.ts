export function mapState(states: Array<string>, store: StoreIF) {
  const maps = {};
  states.forEach(key => {
    maps[key] = function() {
      return store.state[key];
    };
  });
  return maps;
}
