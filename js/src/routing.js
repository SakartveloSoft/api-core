"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const definition_interfaces_1 = require("./definition-interfaces");
const path_to_regexp_1 = __importDefault(require("path-to-regexp"));
const pipeline_1 = require("./pipeline");
class APICompiledRoute extends pipeline_1.APIPipeline {
    constructor(verb, urlTemplate, apiRoute, path) {
        super();
        if (path) {
            this.path = path;
            this.urlTemplate = path.urlTemplate;
        }
        else {
            this.path = null;
            this.urlTemplate = urlTemplate;
            this._keysList = [];
            this._urlRegex = path_to_regexp_1.default(this.urlTemplate, this._keysList);
        }
        this.apiRoute = apiRoute;
        this.name = this.apiRoute && this.apiRoute.name ? this.apiRoute.name : this.urlTemplate;
    }
    checkForRequestMatch(request) {
        if (this.expectedMethod && this.expectedMethod !== definition_interfaces_1.HttpVerb.ALL) {
            if (request.method !== this.expectedMethod) {
                return null;
            }
        }
        let matchResult = this._urlRegex.exec(request.url);
        if (!matchResult) {
            return null;
        }
        let routeParameters = {};
        this._keysList.forEach((key, index) => {
            routeParameters[key.name] = matchResult[index + 1];
        });
        return routeParameters;
    }
}
exports.APICompiledRoute = APICompiledRoute;
//# sourceMappingURL=routing.js.map