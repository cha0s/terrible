export function singleton(key, value) {
  global.__singletons ??= {};
  global.__singletons[key] ??= value;
  return global.__singletons[key];
}

singleton.reset = function (key) {
  delete global.__singletons[key];
}
