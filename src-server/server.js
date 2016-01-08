import fs from "fs";
import path from "path";
import http from "http";
import https from "https";

import _ from "lodash";
import express from "express";
import socketio from "socket.io";

import Router from "./router"

// Middleware
import attachParams from "./middleware/attach-params"
import serverError from "./middleware/server-error";
import router from "./middleware/router";
import reloaderInjector from "./middleware/reloader-injector";
import ioWatchAssets from "./middleware/io-watch-assets";

export default class Server {
    /**
     * @private
     * @property {express.Application} _express
     */
    // _express = null;

    /**
     * @private
     * @property {express.Application} _swapper
     */
    // _swapper = null;

    /**
     * @property {socketio.Server} _sockets
     */
    // _sockets = null;

    /**
     * @private
     * @property {http.Server|https.Server} _server
     */
    // _server = null;


    /**
     * @private
     * @property {Router} router
     */
    // router = null;

    /**
     * @class Server
     * @constructor
     * @param {Object} options
     * @param {ModuleSwapper} options.swapper
     * @param {Logger} options.logger
     * @param {Object} options.routes
     * @param {Logger} options.logger
     */
    constructor(options) {
        this._swapper = options.swapper;
        this._logger = options.logger;
        this._express = express();
        this._sockets = socketio();
        this.router = new Router(this._swapper, {logger: this._logger});
    }

    /**
     * get socket.io host.
     * @return {Socketio.Server}
     */
    getSocketIo() {
        return this._sockets;
    }

    /**
     * Start up http(s) server
     * @param {Object} options
     * @param {ConfigLoader} options.config
     * @param {String} options.appRoot Application running path
     * @param {Object|Boolean} options.https HTTPS options
     * @param {String} options.https.key path to SSL key
     * @param {String} options.https.cert path to SSL cert
     * @param {Number} options.port Listening port number
     * @param {Object} options.routes route definition object
     * @param {Boolean} options.watch if true, enable watch for Controller, Model, View
     */
    async start(options) {
        try {
            this._setExpressConfig(options);
            this._registerMiddlewares(options);
            this.router.load({
                routes  : options.routes,
                controllerDir  : path.join(options.appRoot, "controller/")
            });

            await this._listen(options);
        }
        catch (e) {
            this._logger.error("Server#start", `${e.message}\n${e.stack}`);
            throw e;
        }
    }

    _setExpressConfig(options) {
        this._express.set("views", path.join(options.appRoot, "views/"));
        this._express.set("view engine", options.config.get("maya.view.engine"));
    }

    _registerMiddlewares(options) {
        const staticUrl = options.config.get("maya.server.staticUrl");
        const staticRoot = path.join(options.appRoot, ".tmp/");
        const controllersDir = path.join(options.appRoot, "controller/");

        if (! staticUrl || staticUrl.length === 1 && staticUrl == "/") {
            throw new Error("Config maya.server.staticUrl can not be empty and `/` only.");
        }

        if (staticUrl[0] !== "/") {
            throw new Error("Config maya.server.staticUrl must be start with `/`.");
        }

        if (options.watch) {
            // if `watch` option enabled
            // inject reloader code into all `text/html` responses.
            this._express.use(reloaderInjector());
            this._sockets.use(ioWatchAssets());
        }

        this._express.use(attachParams(this));
        this._express.use(staticUrl, express.static(staticRoot));
        this._express.use(router(this.router));
        this._express.use(serverError());
    }

    async _listen(options) {
        // Create server
        if (options.https) {
            this._server = https.createServer({
                key : fs.readFileSync(options.https.key),
                cert : fs.readFileSync(options.https.cert),
            }, this._express);
        }
        else {
            this._server = http.createServer(this._express);
        }

        // Attach socket.io to server
        this._sockets.attach(this._server);

        // Start server
        return new Promise((resolve, reject) => {
            this._server.listen(options.port, resolve);
        });
    }

    use(...args) {
        this._express.use(...args);
    }
}
