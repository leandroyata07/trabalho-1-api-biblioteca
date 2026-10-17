import { EventEmitter } from "node:events";

const emitter = new EventEmitter();
emitter.setMaxListeners(50);

export const eventBus = {
  publish(eventName, payload) { emitter.emit(eventName, payload); },
  subscribe(eventName, handler) {
    emitter.on(eventName, handler);
    return () => emitter.off(eventName, handler);
  },
};
