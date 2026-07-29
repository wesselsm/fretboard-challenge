export default class StorageProvider {
  async get(_key,_fallbackValue=null){ throw new Error("StorageProvider.get() must be implemented."); }
  async set(_key,_value){ throw new Error("StorageProvider.set() must be implemented."); }
  async remove(_key){ throw new Error("StorageProvider.remove() must be implemented."); }
  async clear(){ throw new Error("StorageProvider.clear() must be implemented."); }
}
