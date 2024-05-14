import App from "./app/main.js";

const app = App.factory(process.argv.slice(2));
//console.log(app.argv);
await app.run();
//console.log("hello");
