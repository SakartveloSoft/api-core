import { HttpVerb, IAPIRoute } from './definition-interfaces';
import { IAPICompiledRoute, IAPIRequest, IAPIRouteParameters, IAPIRoutingPath } from "./api-interfaces";
import { APIPipeline } from "./pipeline";
export declare class APICompiledRoute extends APIPipeline implements IAPICompiledRoute {
    readonly path: IAPIRoutingPath;
    readonly urlTemplate: string;
    readonly expectedMethod: HttpVerb;
    readonly name: string;
    readonly apiRoute: IAPIRoute;
    private readonly _keysList;
    private readonly _urlRegex;
    constructor(verb: HttpVerb, urlTemplate: string, apiRoute: IAPIRoute, path?: IAPIRoutingPath);
    checkForRequestMatch(request: IAPIRequest): IAPIRouteParameters;
}
//# sourceMappingURL=routing.d.ts.map