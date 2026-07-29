export default class EventBus {
  constructor(){ this.listeners = new Map(); }
  on(eventName, callback){
    if(typeof callback !== "function") throw new TypeError("Event listener must be a function.");
    const listeners = this.listeners.get(eventName) ?? new Set();
    listeners.add(callback); this.listeners.set(eventName, listeners);
    return () => this.off(eventName, callback);
  }
  off(eventName, callback){
    const listeners = this.listeners.get(eventName); if(!listeners) return;
    listeners.delete(callback); if(listeners.size===0) this.listeners.delete(eventName);
  }
  emit(eventName, payload){
    const listeners = this.listeners.get(eventName); if(!listeners) return;
    [...listeners].forEach(callback => callback(payload));
  }
  once(eventName, callback){
    const unsubscribe = this.on(eventName, payload => { unsubscribe(); callback(payload); });
    return unsubscribe;
  }
  clear(){ this.listeners.clear(); }
}
