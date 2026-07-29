export default class Project {
  constructor({id=crypto.randomUUID(),name="Untitled Project",description="",scaleIds=[],settings={},createdAt=new Date().toISOString(),updatedAt=new Date().toISOString()}={}){
    this.id=id; this.name=String(name).trim()||"Untitled Project"; this.description=String(description); this.scaleIds=[...scaleIds]; this.settings=structuredClone(settings); this.createdAt=createdAt; this.updatedAt=updatedAt;
  }
  rename(name){ const value=String(name).trim(); if(!value) throw new TypeError("Project name must not be empty."); this.name=value; this.touch(); }
  includeScale(scaleId){ if(!this.scaleIds.includes(scaleId)){ this.scaleIds.push(scaleId); this.touch(); } }
  excludeScale(scaleId){ const n=this.scaleIds.length; this.scaleIds=this.scaleIds.filter(id=>id!==scaleId); if(this.scaleIds.length!==n) this.touch(); }
  touch(){ this.updatedAt=new Date().toISOString(); }
  toJSON(){ return {id:this.id,name:this.name,description:this.description,scaleIds:[...this.scaleIds],settings:structuredClone(this.settings),createdAt:this.createdAt,updatedAt:this.updatedAt}; }
  static fromJSON(value){ return new Project(value); }
}
