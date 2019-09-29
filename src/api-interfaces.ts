import {HttpVerb, IAPIParameter, IAPIRoute, IAPITypeSchema} from "./definition-interfaces";
import {APIRequest, APIResponder} from "./pipeline";

export interface IHostingEnvironment {
    readonly environmentId: string;
    processResponse(request: APIRequest, responder:APIResponder):Promise<void>;
    processError(request: APIRequest, responder: APIResponder, error: IAPIError): Promise<void>;
}


export interface IAPITypesResolver {
    resolveType(typeAlias: string):IAPITypeSchema;
}

export interface IAPIRequestQuery {
    [name: string]: string
}

export interface IAPIHeaders {
    headers: {[name: string]: string|string[]};
    getContentType(): string;
    setContentType(contentType: string): IAPIHeaders;
    getContentLength():number;
    setContentLength(length:number): IAPIHeaders;
}

export interface IAPIRequestHeaders extends IAPIHeaders {
    authorization: string;
}

export interface IAPIResponseHeaders extends IAPIHeaders {
}

export interface IHttpFormData {
    [name: string]: string|string[];
}

export enum APIRequestBodyMode {
    NotParsed = "unknown",
    JSON = "json",
    WebForm = "webForm",
    Multipart = "multipart",
    RawBuffer = "rawBuffer"
}

export interface IAPIUserReference {
    authenticated: boolean;
    userId: string;
    userName: string;
    roles: {[name: string]: boolean }
}

export type IAPIRouteParameters = { [name: string]:any };

export interface IAPIRequest extends IAPIRequestHeaders {
    method: HttpVerb;
    url: string;
    requestId: string;
    path: string;
    query: IAPIRequestQuery;
    matchedRoute: IAPICompiledRoute;
    parameters: IAPIRouteParameters;
    bodyType: APIRequestBodyMode,
    body: any;
    getJSON():Object;
    getJSONBody<T>():T;
    getBinaryBody():Buffer;
    getFormValues():IHttpFormData;
    user: IAPIUserReference;
    setBodyToBuffer(body:Buffer): IAPIRequest;
    setBodyToJSON(parsedBody:Object): IAPIRequest;
    setBodyToModel<T>(parsedBody: T):IAPIRequest;

}

export enum HttpStatusCode {
    Continue= 100,
    Ok = 200,
    Created = 201,
    NoContent = 204,
    PartialContent = 206,
    PermanentRedirect = 301,
    TemporaryRedirect = 302,
    BadRequest = 400,
    Forbidden = 403,
    NotFound = 404,
    ServerError = 500,
    NotImplemented = 501
}

export interface IAPIResponse extends IAPIResponseHeaders {
    status?: HttpStatusCode;
    headersSent: boolean;
    body: any;
}

export enum APIResultAction {
    Done = "done",
    CallNext = "callNext",
    SendHeadersOnly = 'sendHeadersOnly',
    ReportError = "error",
    SendJSON = "sendJSON",
    SendHtml = "sendHtml",
    SendBuffer = "sendBuffer",
    SendStream = "sendStream"
}

export interface IAPIResult {
    action: APIResultAction;
}

export interface IAPIError {
    message: string;
    stack: string;
    details?: Object
}

export interface IAPIResponder extends IAPIResult, IAPIResponse {
    done(): Promise<IAPIResult>;
    next(): Promise<IAPIResult>;
    json(value: any): Promise<IAPIResult>;
    buffer(content: Buffer, contentType?: string): Promise<IAPIResult>;
    html(content: string): Promise<IAPIResult>;
    redirect(url:string, permanent?: boolean): Promise<IAPIResult>;
    forbidden(error?: IAPIError): Promise<IAPIResult>;
    notFound(error?: IAPIError): Promise<IAPIResult>;
    noContent(): Promise<IAPIResult>;
}


export type APIHandlerFunc = (request: IAPIRequest, responder: IAPIResponder) => Promise<IAPIResult>;

export interface IAPIHandler {
    processRequest(request: IAPIRequest, responder: IAPIResponder) : Promise<IAPIResult>;
    callback(): APIHandlerFunc;
}

export interface IAPIPipeline extends IAPIHandler {
    prependHandler(handler: APIHandlerFunc): IAPIPipeline;
    appendHandler(handler: APIHandlerFunc): IAPIPipeline;
    appendPipeline(other: IAPIPipeline): IAPIPipeline;
    prependPipeline(other: IAPIPipeline): IAPIPipeline;
}

export interface IAPIUrlTemplate {
    readonly urlTemplate: string;
    validateUrl(url: string) : IAPIRouteParameters;
    append(...segments:(string|IAPIUrlTemplate)[]): IAPIUrlTemplate;
    prepend(...segments:(string|IAPIUrlTemplate)[]): IAPIUrlTemplate;
}

export interface IAPICompiledRoute extends IAPIPipeline {
    readonly path: IAPIRoutingPath;
    readonly apiRoute: IAPIRoute;
    readonly expectedMethod: HttpVerb;
    readonly urlTemplate: IAPIUrlTemplate;
    readonly name: string;
    readonly controller: string;
    readonly action: string;
    readonly parameters: IAPIParameter[];
    checkForRequestMatch(method: HttpVerb, url: string): IAPIRouteParameters;
}

export interface IAPIRoutingPath {
    urlTemplate: IAPIUrlTemplate;
    checkUrl(url: string):IAPIRouteParameters;
    hasRoute(method: HttpVerb): boolean;
    tryGetRoute(method: HttpVerb): IAPICompiledRoute;
    ensureForRoute(method: HttpVerb, apiRoute?: IAPIRoute): IAPICompiledRoute;
    get(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    post(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    put(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    del(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    options(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    all(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath;
}

export interface IAPIRouteCheckResult {
    url: string;
    route: IAPICompiledRoute;
    parameters: IAPIRouteParameters;
}

export interface IAPIHandlersCompiler {
    compileHandlers(apiCompiledRoute: IAPICompiledRoute, apiRoute: IAPIRoute): APIHandlerFunc[];
}


export interface IAPIRouter extends IAPIHandler {
    attachHandlersCompiler(handlersCompiler: IAPIHandlersCompiler): void;
    forRoute(route: IAPIRoute, ...handlers: APIHandlerFunc[]): IAPIRouter;
    tryPickRoute(method: HttpVerb, urlPath: string): IAPIRouteCheckResult;
    forPath(urlTemplate: string|IAPIUrlTemplate): IAPIRoutingPath;
    get(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    post(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    put(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    del(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    options(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    all(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
}

