export const bus = new EventTarget();
export function emit(type, detail = {}) { bus.dispatchEvent(new CustomEvent(type, { detail })); }
export function on(type, handler) { bus.addEventListener(type, handler); }
