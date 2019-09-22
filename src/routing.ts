import {
    APIHandlerFunc,
    HttpVerb,
    IAPICompiledRoute, IAPIPipeline,
    IAPIRequest,
    IAPIResponder,
    IAPIResult,
    IAPIRoute,
    IAPIRoutingPath
} from './api-interfaces';
import pathToRegexp from "path-to-regexp";
import {Key} from "path-to-regexp";

class APICompiledRoute implements IAPICompiledRoute {
    public readonly path: IAPIRoutingPath;
    public readonly urlTemplate: string;
    public readonly expectedMethod: HttpVerb;
    public readonly name: string;
    public readonly apiRoute: IAPIRoute;
    private readonly _keysList: Key[];
    private readonly  _urlRegex: RegExp;
    private _handlers: APIHandlerFunc[];
    constructor(verb: HttpVerb, urlTemplate: string, apiRoute: IAPIRoute, path?: IAPIRoutingPath) {
        if (path) {
            this.path = path;
            this.urlTemplate = path.urlTemplate;
        } else {
            this.path = null;
            this.urlTemplate = urlTemplate;
            this._keysList = [];
            this._urlRegex =  pathToRegexp(this.urlTemplate, this._keysList);
        }
        this.apiRoute = apiRoute;
        this.name = this.apiRoute && this.apiRoute.name ? this.apiRoute.name :  this.urlTemplate;
    }
    appendHandler(handler: APIHandlerFunc): IAPIPipeline {
        this._handlers.push(handler);
        return this;
    }
    prependHandler(handler: APIHandlerFunc): IAPIPipeline {
        this._handlers.splice(0, 0, handler);
        return this;
    }
    appendPipeline(other: IAPIPipeline): IAPIPipeline {
        return this.appendHandler(other.callback());
    }
    prependPipeline(other: IAPIPipeline): IAPIPipeline {
        return this.appendHandler(other.callback());
    }
    callback(): APIHandlerFunc {
        return (request: IAPIRequest, responder: IAPIResponder) =>  {
            return Promise.reject(new Error('Not implemented'));
        };
    }
}