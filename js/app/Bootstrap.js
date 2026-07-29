import FretMasterApp from "./FretMasterApp.js";
const rootElement=document.getElementById("app");
const app=new FretMasterApp(rootElement);
try{ await app.initialize(); app.run(); window.fretMasterApp=app; }catch(error){ app.handleError(error); }
