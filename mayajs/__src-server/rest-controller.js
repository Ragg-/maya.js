import _ from "lodash";
import extend from "./utils/extend";
import * as deep from "./utils/deep";

import ValidationError from "./exception/validation-error";
import Controller from "./controller";

// Write class uses function
// For listup RestController methods in Router.
export default function RestController() {
    if (_.isFunction(this._init)) {
        this._init();
    }
}

/**
 * @static
 * @method create
 * @param {Object} proto
 * @param {String|Model} proto._model
 * @return {RestController}
 */
RestController.create = proto => {
    const SubClass = extend(proto, RestController);
    const instance = new SubClass();

    if (_.isFunction(instance._init)) {
        instance._init();
    }

    if (typeof proto._model !== "string") {
        throw new Error("Model property must be (dot-notation) model name string for reference `maya.models`.");
    }

    return instance;
};


RestController.prototype = _.extend(Object.create(Controller), {
    _before() {
        this.model = deep.get(maya.models, this._model);
    },

    _dispose() {
        delete this.model;
    },

    // Delegation handler for Router register

    "get_index"(ctx) {
        return this._list(ctx);
    },

    "get_:id"(ctx) {
        return this._get(ctx);
    },

    "post_index"(ctx) {
        return this._create(ctx);
    },

    "delete_:id"(ctx) {
        return this._delete(ctx);
    },

    "put_:id"(ctx) {
        return this._update(ctx);
    },

    "patch_:id"(ctx) {
        return this._update(ctx);
    },

    // Real handlers

    *_list(ctx) {
        try {
            ctx.body = yield this.model.find() || [];
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    },

    *_get(ctx) {
        try {
            const hit = yield this.model.find(ctx.params.id);

            if (hit.length) {
                ctx.body = hit[0];
            }
            else {
                ctx.status = 404;
            }
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    },

    *_create(ctx) {
        try {
            const created = yield this.model.create(ctx.field());
            ctx.body = created;
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    },

    *_delete(ctx) {
        try {
            ctx.body = yield this.model.destroy(ctx.params.id);
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    },

    *_update(ctx) {
        try {
            ctx.body = (yield this.model.update(ctx.params.id, ctx.field()));
        }
        catch (e) {
            yield this._handleError(ctx, e);
        }
    },

    *_handleError(ctx, err) {
        const error = err.originalError ? err.originalError : err;

        if (error instanceof ValidationError) {
            ctx.status = 400;
            ctx.body = {error:"validation", fails : error.fails};
        }
        else {
            ctx.status = 500;
            ctx.body = {error:"exception"};
            maya.logger.error(error.stack);
        }
    }
});
