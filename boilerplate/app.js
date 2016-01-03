var Maya = require("maya");

// If you want to use some loader(babel, coffeescript, etc...)
// Write requre register here. (and install using module via `npm`)
// require("babel-register");
// require("coffee-script/register");

var options = Maya.App.parseArgs(process.argv.slice(2));
var app = new Maya.App(Object.assign(options, {
    appRoot: process.cwd()
}));

// If you want to use middleware.
// Write `app.use(middleware)` here.
app.use(require("body-parser"));
app.use(require("cookie-parser"));
app.use(require("express-session")({
    resave : false,
    saveUninitialized : false,
    secret : app.config.get("session.secret"),
}));
app.use(require("method-override"));

app.start();
