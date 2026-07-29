import StorageProvider from "./StorageProvider.js";
export default class LocalStorageProvider extends StorageProvider {
  constructor(namespace,storage=window.localStorage){ super(); if(!namespace) throw new TypeError("A storage namespace is required."); this.namespace=namespace; this.storage=storage; }
  async get(key,fallbackValue=null){ const raw=this.storage.getItem(this.#createKey(key)); if(raw===null) return fallbackValue; try{return JSON.parse(raw);}catch(error){throw new Error(`Stored value "${key}" contains invalid JSON.`,{cause:error});} }
  async set(key,value){ this.storage.setItem(this.#createKey(key),JSON.stringify(value)); }
  async remove(key){ this.storage.removeItem(this.#createKey(key)); }
  async clear(){ const prefix=`${this.namespace}:`; const keys=[]; for(let i=0;i<this.storage.length;i+=1){const key=this.storage.key(i); if(key?.startsWith(prefix)) keys.push(key);} keys.forEach(key=>this.storage.removeItem(key)); }
  #createKey(key){ return `${this.namespace}:${key}`; }
}
