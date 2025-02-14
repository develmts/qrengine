import App from "./app/main.js";


const app = App.factory(process.argv);

await app.run();
