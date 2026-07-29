export default class Scale {
  constructor({id=crypto.randomUUID(),name,subtitle="",pattern=[],createdAt=new Date().toISOString(),updatedAt=new Date().toISOString()}){
    if(typeof name!=="string" || name.trim()==="") throw new TypeError("Scale name must be a non-empty string.");
    if(!Array.isArray(pattern)) throw new TypeError("Scale pattern must be an array.");
    this.id=id; this.name=name.trim(); this.subtitle=String(subtitle); this.pattern=structuredClone(pattern); this.createdAt=createdAt; this.updatedAt=updatedAt;
  }
  rename(name,subtitle=this.subtitle){ if(typeof name!=="string"||name.trim()==="") throw new TypeError("Scale name must be a non-empty string."); this.name=name.trim(); this.subtitle=String(subtitle); this.touch(); }
  setPattern(pattern){ if(!Array.isArray(pattern)) throw new TypeError("Scale pattern must be an array."); this.pattern=structuredClone(pattern); this.touch(); }
  touch(){ this.updatedAt=new Date().toISOString(); }
  toJSON(){ return {id:this.id,name:this.name,subtitle:this.subtitle,pattern:structuredClone(this.pattern),createdAt:this.createdAt,updatedAt:this.updatedAt}; }
  static fromJSON(value){ return new Scale(value); }
}
