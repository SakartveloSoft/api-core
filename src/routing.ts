import {
    HttpVerb,
    IAPICompiledRoute,
    IAPIRequest,
    IAPIRoute,
    IAPIRouteParameters,
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
    checkForRequestMatch(request: IAPIRequest): IAPIRouteParameters {
        if (this.expectedMethod && this.expectedMethod !== HttpVerb.ALL) {
            if (request.method !== this.expectedMethod) {
                return null;
            }
        }
        let matchResult = this._urlRegex.exec(request.url);
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


