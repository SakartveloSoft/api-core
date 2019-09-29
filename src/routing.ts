import {HttpVerb, IAPIParameter, IAPIRoute,} from './definition-interfaces'
import {
    APIHandlerFunc,
    IAPICompiledRoute, IAPIHandlersCompiler,
    IAPIRequest,
    IAPIResponder,
    IAPIResult,
    IAPIRouteCheckResult,
    IAPIRouteParameters,
    IAPIRouter,
    IAPIRoutingPath,
    IAPIUrlTemplate
} from "./api-interfaces";
import pathToRegexp, {Key} from "path-to-regexp";
import {APIPipeline} from "./pipeline";

function combineUrlPaths(a: string, b:string):string {
    if (a.length === 0) {
        if (b.length === 0) {
            return '';
        }
        return b;
    }
    if (b.length === 0) {
        return b;
    }
    return (a.charAt(a.length-1) === '/' ? a.substr(0, a.length-1) : a) +  (b.charAt(0) === '/' ? b : ('/' + b));
}

class APIUrlTemplate implements IAPIUrlTemplate {
    public readonly urlTemplate: string;
    private pathRegexp: RegExp;
    private keysList: Key[];
    constructor(urlTemplate: string) {
        this.urlTemplate = urlTemplate;
        this.pathRegexp = pathToRegexp(urlTemplate, this.keysList);
    }
    validateUrl(url: string): IAPIRouteParameters {
        if ((this.urlTemplate.charAt(0) !== '/') && (url.charAt(0) === '/')) {
            url = url.substr(1);
        }
        if (!this.keysList) {
            this.keysList = [];
            this.pathRegexp = pathToRegexp(this.urlTemplate, this.keysList);
        }
        let matchResult = this.pathRegexp.exec(url);
        if (matchResult) {
            let parameters:IAPIRouteParameters = {};
            for(let x = 0; x < this.keysList.length; x++) {
                const key = this.keysList[x];
                parameters[key.name] = matchResult[x+1];
            }
            return parameters;
        }
        return null;
    }
    append(...pathSegments:(string|IAPIUrlTemplate)[]) {
        let fullUrl = this.urlTemplate;
        for(const segment of pathSegments) {
            fullUrl = combineUrlPaths(fullUrl, typeof(segment) === 'string' ? segment : segment.urlTemplate);
        }
        return new APIUrlTemplate(fullUrl);
    }
    prepend(...pathSegments:(string|IAPIUrlTemplate)[]) {
        let fullUrl = this.urlTemplate;
        for(const segment of pathSegments) {
            fullUrl = combineUrlPaths(typeof(segment) === 'string' ? segment : segment.urlTemplate, fullUrl);
        }
        return new APIUrlTemplate(fullUrl);
    }
    [Symbol.toPrimitive](hint:string): any {
        if (hint === 'number') {
            return NaN;
        }
        return this.urlTemplate;
    }
    toString(): string {
        return this.urlTemplate;
    }
    ["valueOf"]():string {
        return this.urlTemplate;
    }
}

export function makeUrlTemplate(baseUrl: string, ...segments: string[]): IAPIUrlTemplate {
    let url = baseUrl;
    for(const segment of segments) {
        url = combineUrlPaths(url, segment);
    }
    return new APIUrlTemplate(url);
}

export class APICompiledRoute extends APIPipeline implements IAPICompiledRoute {
    public readonly path: IAPIRoutingPath;
    public readonly urlTemplate: IAPIUrlTemplate;
    public readonly expectedMethod: HttpVerb;
    public readonly name: string;
    public readonly apiRoute: IAPIRoute;
    public readonly controller: string;
    public readonly action: string;
    public readonly parameters: IAPIParameter[] = [];
    constructor(verb: HttpVerb, urlTemplate: string|IAPIUrlTemplate, apiRoute: IAPIRoute, path?: IAPIRoutingPath, overrideName?: string, controllerId?: string, actionId?: string) {
        super();
        if (path) {
            this.path = path;
            this.urlTemplate = path.urlTemplate;
        } else {
            this.path = null;
            this.urlTemplate = typeof (urlTemplate) === 'string' ?  new APIUrlTemplate(urlTemplate) : urlTemplate;
        }
        this.apiRoute = apiRoute;
        if (overrideName) {
            this.name = overrideName;
        } else {
            this.name = this.apiRoute && this.apiRoute.name ? this.apiRoute.name : this.urlTemplate.urlTemplate;
        }
        if (controllerId !== undefined && controllerId !== null) {
            this.controller = controllerId;
        } else if (apiRoute) {
            this.controller = apiRoute.controller;
        }
        if (actionId !== undefined && actionId !== null) {
            this.action = actionId;
        } else if (apiRoute) {
            this.action = apiRoute.action;
        }

        if (apiRoute) {
            if (apiRoute.parameters && apiRoute.parameters.length > 0) {
                this.parameters = this.parameters.concat(apiRoute.parameters)
            }
            let apiNode = apiRoute.parent;
            while (apiNode) {
                if (!this.controller && apiNode.controller) {
                    this.controller = apiNode.controller;
                }
                if (!this.action && apiNode.action) {
                    this.action = apiNode.action;
                }
                if (apiNode.parameters && apiNode.parameters.length > 0) {
                    this.parameters = apiNode.parameters.concat(this.parameters);
                }
                apiNode = apiNode.parent;
            }
        }

    }
    checkForRequestMatch(method:HttpVerb, requestUrl: string): IAPIRouteParameters {
        if (this.expectedMethod && this.expectedMethod !== HttpVerb.ALL) {
            if (method !== this.expectedMethod) {
                return null;
            }
        }
        return this.urlTemplate.validateUrl(requestUrl);
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
    public urlTemplate: IAPIUrlTemplate;
    private routesMap: {[key in HttpVerb]?: IAPICompiledRoute } = {
        [HttpVerb.GET] : null,
        [HttpVerb.POST]: null,
        [HttpVerb.PUT]: null,
        [HttpVerb.DELETE]: null,
        [HttpVerb.OPTIONS]: null
    };
    constructor(urlTemplate: string|IAPIUrlTemplate) {
        this.urlTemplate = typeof(urlTemplate) === 'string' ? new APIUrlTemplate(urlTemplate) : urlTemplate;
    }

    private addHandlers(verb:HttpVerb, handlers: APIHandlerFunc| APIHandlerFunc[]) {
        let pipeline = this.ensureForRoute(verb);
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
        return this.urlTemplate.validateUrl(url);
    }

    del(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.DELETE,  handlerFunc);
        return this;
    }

    ensureForRoute(method: HttpVerb, route?: IAPIRoute): IAPICompiledRoute {
        let compiledRoute: IAPICompiledRoute = this.routesMap[method];
        if (!compiledRoute) {
            let fullNames = [route.name || (route.verb + ' ' + (route.routePrefix || '') + (route.routeTemplate || ''))];
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
                if (!actionId && apiNode.action) {
                    actionId = apiNode.action;
                }
                if (!controllerId && apiNode.controller) {
                    controllerId = apiNode.controller;
                }
                apiNode = apiNode.parent;
            }
            compiledRoute = new APICompiledRoute(method, this.urlTemplate, route || null, this, fullNames.join('/'), controllerId, actionId);
            this.routesMap[method] = compiledRoute;
        }
        return compiledRoute;
    }

    get(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath {
        this.addHandlers(HttpVerb.GET,  handlerFunc);
        return this;
    }

    hasRoute(method: HttpVerb): boolean {
        let pipeline = this.routesMap[method];
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

    tryGetRoute(method: HttpVerb): IAPICompiledRoute {
        return this.routesMap[method] || null;
    }
}


export class APIRouter implements IAPIRouter {
    private pathsMap : {[urlTemplate : string]: APIRoutingPath } = {};
    private pathsList: IAPIRoutingPath[] = [];

    private handlersCompiler: IAPIHandlersCompiler;

    attachHandlersCompiler(handlersCompiler: IAPIHandlersCompiler): void {
        this.handlersCompiler = handlersCompiler;
    }

    tryPickRoute(method: HttpVerb, urlPath: string): IAPIRouteCheckResult  {
        for(const path of this.pathsList) {
            if (path.hasRoute(method)) {
                let route = path.tryGetRoute(method);
                let urlParameters = path.checkUrl(urlPath);
                if (urlParameters) {
                    return new RouteCheckResult(urlPath, route, urlParameters);
                }
            }

        }
        return null;
    }

    private getAPIPathByTemplate(urlTemplate: string|IAPIUrlTemplate, autoCreate?: boolean) {
        let templateString = typeof(urlTemplate) === 'string' ? urlTemplate : urlTemplate.urlTemplate;
        let apiPath = this.pathsMap[templateString];
        if (!apiPath && autoCreate) {
            apiPath = new APIRoutingPath(urlTemplate);
            this.pathsMap[templateString] = apiPath;
            this.pathsList.push(apiPath);
        }
        return apiPath;
    }


    forRoute(route: IAPIRoute, ...handlers:APIHandlerFunc[]): IAPIRouter{
        let fullPath =  new APIUrlTemplate((route.routePrefix || '') + (route.routeTemplate || ''));
        let apiNode = route.parent;
        while(apiNode) {
            if (apiNode.routePrefix) {
                fullPath = fullPath.prepend(apiNode.routePrefix);
            }
            apiNode = apiNode.parent;
        }
        let pathEntry =  this.forPath(fullPath);
        let compiledRoute = pathEntry.tryGetRoute(route.verb);
        if (!compiledRoute) {
            compiledRoute = pathEntry.ensureForRoute(route.verb, route);
            if (this.handlersCompiler) {
                let handlers = this.handlersCompiler.compileHandlers(compiledRoute, route);
                for(const handler of handlers) {
                    compiledRoute.appendHandler(handler);
                }
            }
        }
        for(let x = 0; x < handlers.length; x++) {
            compiledRoute.appendHandler(handlers[x]);
        }
        return this;
    }

    all(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url).all(...func);
        return this;
    }

    processRequest(request: IAPIRequest, responder: IAPIResponder): Promise<IAPIResult> {
        for (const pathRef of this.pathsList) {
            let pipeline = pathRef.tryGetRoute(request.method) || pathRef.tryGetRoute(HttpVerb.ALL);
            if (pipeline) {
                let urlResult = pathRef.checkUrl(request.path);
                if (urlResult !== undefined && urlResult !== null) {
                    return pipeline.processRequest(request, responder);
                }
            }
        }
        return responder.next();
    }

    callback(): (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult> {
        return this.processRequest.bind(this);
    }

    del(url: string, ...func: APIHandlerFunc[]): IAPIRouter {
        this.getAPIPathByTemplate(url, true).del(...func);
        return this;
    }

    forPath(urlTemplate: string|IAPIUrlTemplate): IAPIRoutingPath {
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