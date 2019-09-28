import {HttpVerb, IAPIRoute,} from './definition-interfaces'
import {
    APIHandlerFunc,
    IAPICompiledRoute,
    IAPIPipeline,
    IAPIRequest,
    IAPIResponder,
    IAPIResult,
    IAPIRouteCheckResult,
    IAPIRouteParameters,
    IAPIRouter,
    IAPIRoutingPath
} from "./api-interfaces";
import pathToRegexp, {Key} from "path-to-regexp";
import {APIPipeline} from "./pipeline";

export class APICompiledRoute extends APIPipeline implements IAPICompiledRoute {
    public readonly path: IAPIRoutingPath;
    public readonly urlTemplate: string;
    public readonly expectedMethod: HttpVerb;
    public readonly name: string;
    public readonly apiRoute: IAPIRoute;
    private readonly _keysList: Key[];
    private readonly  _urlRegex: RegExp;
    constructor(verb: HttpVerb, urlTemplate: string, apiRoute: IAPIRoute, path?: IAPIRoutingPath) {
        super();
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
    checkForRequestMatch(method:HttpVerb, requestUrl: string): IAPIRouteParameters {
        if (this.expectedMethod && this.expectedMethod !== HttpVerb.ALL) {
            if (method !== this.expectedMethod) {
                return null;
            }
        }
        let matchResult = this._urlRegex.exec(requestUrl);
        if (!matchResult) {
            return null;
        }
        let routeParameters: IAPIRouteParameters = {};
        this._keysList.forEach((key, index) => {
            routeParameters[key.name] = matchResult[index + 1];
        });
        return routeParameters;
    }
}

export class RouteCheckResult implements IAPIRouteCheckResult{
    public url: string;
    public route: IAPICompiledRoute;
    public parameters: IAPIRouteParameters;
    constructor(url:string, route: IAPICompiledRoute, parameters:IAPIRouteParameters) {
        this.url = url;
        this.route = route;
        this.parameters = parameters;
    }
}

class APIRoutingPath implements IAPIRoutingPath {
    public urlTemplate: string;
    private parametersList:Key[] = [];
    private pathRegexp: RegExp;
    private pipelinesMap: {[key in HttpVerb]?: IAPIPipeline } = {
        [HttpVerb.GET] : null,
        [HttpVerb.POST]: null,
        [HttpVerb.PUT]: null,
        [HttpVerb.DELETE]: null,
        [HttpVerb.OPTIONS]: null
    };
    constructor(urlTemplate: string) {
        this.urlTemplate = urlTemplate;
        this.pathRegexp = pathToRegexp(this.urlTemplate, this.parametersList);
    }

    private addHandlers(verb:HttpVerb, handlers: APIHandlerFunc| APIHandlerFunc[]) {
        let pipeline = this.ensureForPipeline(verb);
        if (Array.isArray(handlers)) {
            for (let x = 0; x < handlers.length; x++) {
                pipeline.appendHandler(handlers[x]);
            }
        } else if (typeof (handlers) == "function") {
            pipeline.appendHandler(handlers);
        } else {
            throw new Error('Invalid handler, APIHandlerFunc expected ' + handlers);
        }
    }

    all(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.GET, handlerFunc);
        this.addHandlers(HttpVerb.POST, handlerFunc);
        this.addHandlers(HttpVerb.PUT, handlerFunc);
        this.addHandlers(HttpVerb.DELETE, handlerFunc);
        this.addHandlers(HttpVerb.OPTIONS, handlerFunc);
        return this;
    }

    checkUrl(url: string): IAPIRouteParameters {
        let matchResult = this.pathRegexp.exec(url);
        if (matchResult !== undefined && matchResult !== null) {
            let parameters: IAPIRouteParameters = {};
            for(let x = 0; x < this.parametersList.length; x++) {
                let keyInfo = this.parametersList[x];
                parameters[keyInfo.name] = matchResult[x+1]
            }
            return parameters;
        }
        return null;
    }

    del(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.DELETE,  handlerFunc);
        return this;
    }

    ensureForPipeline(method: HttpVerb): IAPIPipeline {
        let pipeline: IAPIPipeline = this.pipelinesMap[method];
        if (!pipeline) {
            pipeline = new APIPipeline();
            this.pipelinesMap[method] = pipeline;
        }
        return pipeline;
    }

    get(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.GET,  handlerFunc);
        return this;
    }

    hasPipeline(method: HttpVerb): boolean {
        let pipeline = this.pipelinesMap[method];
        return pipeline !== null && pipeline !== undefined;
    }

    options(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.OPTIONS,  handlerFunc);
        return this;
    }

    post(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.POST,  handlerFunc);
        return this;
    }

    put(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.PUT,  handlerFunc);
        return this;
    }

    tryGetPipeline(method: HttpVerb): IAPIPipeline {
        return this.pipelinesMap[method] || null;
    }
    bindPipeline(verb: HttpVerb, pipeline:IAPIPipeline): void {
        this.pipelinesMap[verb] = pipeline;
    }
}

function compileRouteDefaultHandlers(route: IAPIRoute, compiledRoute: IAPICompiledRoute):APIHandlerFunc[] {
    if (!route || !compiledRoute) {
        throw new Error('route and compiledRoute are required parameters');
    }
    if (!(compiledRoute instanceof APICompiledRoute)) {
        throw new Error('compiled route must be instance of APICompiledRoute');
    }
    return null;
}

export class APIRouter implements IAPIRouter {
    private compiledRoutesList : IAPICompiledRoute[] = [];
    private pathsMap : {[urlTemplate : string]: APIRoutingPath } = {};

    tryPickRoute(method: HttpVerb, urlPath: string): IAPIRouteCheckResult  {
        for(let x = 0; x < this.compiledRoutesList.length; x++) {
            let route = this.compiledRoutesList[x];
            let paramsBag = route.checkForRequestMatch(method, urlPath);
            if (paramsBag !== null && paramsBag !== undefined) {
                return new RouteCheckResult(urlPath, route, paramsBag);
            }
        }
        return null;
    }

    private getAPIPathByTemplate(urlTemplate: string, autoCreate?: boolean) {
        let apiPath = this.pathsMap[urlTemplate];
        if (!apiPath && autoCreate) {
            apiPath = new APIRoutingPath(urlTemplate);
            this.pathsMap[urlTemplate] = apiPath;
        }
        return apiPath;
    }


    forRoute(route: IAPIRoute, ...handlers:APIHandlerFunc[]): IAPIRouter{
        let fullNames = [route.name || (route.verb + ' ' + (route.routePrefix || '') + (route.routeTemplate || ''))];
        let fullPath =  (route.routePrefix || '') + (route.routeTemplate || '');
        let controllerId = route.controller;
        let actionId = route.action;
        let paramsList = route.parameters || [];
        let apiNode = route.parent;
        while(apiNode) {
            if (apiNode.parameters) {
                paramsList = apiNode.parameters.concat(paramsList);
            }
            if (apiNode.name) {
                fullNames.splice(0, 0, apiNode.name);
            }
            if (apiNode.routePrefix) {
                fullPath = apiNode.routePrefix + fullPath;
            }
            if (!actionId && apiNode.action) {
                actionId = apiNode.action;
            }
            if (!controllerId && apiNode.controller) {
                controllerId = apiNode.controller;
            }
            apiNode = apiNode.parent;
        }
        fullPath = fullPath.replace(/\/\//g, '/');
        let pathEntry =  this.forPath(fullPath);
        let pipeline = pathEntry.tryGetPipeline(route.verb);
        if (!pipeline) {
            let compiledRoute = new APICompiledRoute(route.verb, fullPath, route, pathEntry);
            pathEntry.bindPipeline(route.verb, compiledRoute);
            this.compiledRoutesList.push(compiledRoute);
            pipeline = compiledRoute;
            compileRouteDefaultHandlers(route, compiledRoute);
        }
        for(let x = 0; x < handlers.length; x++) {
            pipeline.appendHandler(handlers[x]);
        }
        return this;
    }

    all(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url).all(...func);
        return this;
    }

    callback(): (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult> {
        return (request: IAPIRequest, responder: IAPIResponder): Promise<IAPIResult> => {
            for (let pathRef in this.pathsMap) {
                let pathEntry = this.pathsMap[pathRef];
                if (pathEntry.hasPipeline(request.method) || pathEntry.hasPipeline(HttpVerb.ALL)) {
                    let urlResult = pathEntry.checkUrl(request.url);
                    if (urlResult !== undefined && urlResult !== null) {
                        let pipeline = pathEntry.tryGetPipeline(request.method);
                        if (pipeline) {
                            return pipeline.callback()(request, responder);
                        }
                    }
                }
            }
            return responder.next();
        };
    }

    del(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).del(...func);
        return this;
    }

    forPath(urlTemplate: string): IAPIRoutingPath {
        return this.getAPIPathByTemplate(urlTemplate, true);
    }

    get(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).get(...func);
        return this;
    }

    options(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).options(...func);
        return this;
    }

    post(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).post(...func);
        return this;
    }

    put(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).put(...func);
        return this;
    }
}