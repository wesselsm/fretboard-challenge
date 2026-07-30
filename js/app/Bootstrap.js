import GuitarNeckPilotApp from "./GuitarNeckPilotApp.js";

const rootElement = document.getElementById("app");
const app = new GuitarNeckPilotApp(rootElement);

try {
    await app.initialize();
    app.run();
    window.guitarNeckPilotApp = app;
    document.getElementById("splashScreen")?.classList.add("splash-screen--hidden");
    window.setTimeout(() => document.getElementById("splashScreen")?.remove(), 500);
} catch (error) {
    document.getElementById("splashScreen")?.remove();
    app.handleError(error);
}
