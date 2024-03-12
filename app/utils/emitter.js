export class Emitter {
  listeners = new Set();
  emit(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
  addListener(listener) {
    this.listeners.add(listener);
  }
  removeListener(listener) {
    this.listeners.delete(listener);
  }
}
