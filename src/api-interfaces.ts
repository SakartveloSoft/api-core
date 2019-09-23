
export enum APIValueType {
    Any= "any",
    Null ="null",
    String = "string",
    Boolean = "bool",
    Integer = "int",
    Float = "float",
    Date = "date",
    Choice = "choice",
    Array = "array",
    Object = "object"
}

export interface IAPIChoiceOption {
    value : (string|number|boolean|Date|null),
    label: string
}

export interface IAPIValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?:number|Date;
    max?:number|Date;
}

export interface IAPIPropertyDescriptor extends IAPIValidationRules {
    name?: string;
    isMapName?: boolean;
    valueSchema?: IAPITypeSchema;
    valueSchemaAlias?: string;
    defaultValue? : any;
}

export interface IAPITypeSchema {
    typeAlias?: string;
    valueType : APIValueType;
    choiceList?: IAPIChoiceOption[]|null;
    itemsType?: IAPITypeSchema|null;
    itemsTypeAlias?: string;
    properties?:{[name:string]:IAPIPropertyDescriptor };
    preventExtraProperties?: boolean;
}

export interface IAPITypesResolver {
    resolveType(typeAlias: string):IAPITypeSchema;
}

export enum APIValueSourceType {
    Route = "route",
    Path = "path",
    QueryString = "query",
    Headers = "headers",
    Body = "body"

}

export interface IAPIParameter extends IAPIValidationRules {
    name?: string;
    sourceType: APIValueSourceType;
    valueSchema: IAPITypeSchema;
    valueSchemaAlias?: string;
}

export enum HttpVerb {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    ALL = "ALL"
}

export interface IAPINode {
    name: string;
    routePrefix?: string;
    controller?: string;
    action?: string;
    parent?: IAPINode
}

export interface IAPIRoute extends IAPINode {
    verb: HttpVerb;
    routeTemplate: string;
    parameters?: IAPIParameter[];
    responseType?: IAPITypeSchema;
    responseTypeAlias?:string;
    errorTypes?: {[status: number]: IAPITypeSchema|string}
}

export interface IAPIGroup extends IAPINode {
    groups?: IAPIGroup[]
    routes?: IAPIRoute[]

}

export enum APIModuleCreationMethod {
    ConstructorCall = "constructor",
    FunctionCall = "function",
    ModuleResult = "module",
}

export interface IAPIModuleEntryDefinition {
    path: string;
    creationMethod?: APIModuleCreationMethod;
    singleton?: boolean
}


export interface IAPIStructure extends IAPIGroup{
    pathRoot: string;
    version: string;
    modules: {[name:string]: IAPIModuleEntryDefinition };
    types: {[name: string]: IAPITypeSchema};
    defaultResponseType: IAPITypeSchema;
    errorTypes: {[status: number]: IAPITypeSchema};
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
    callback(): APIHandlerFunc;
}

export interface IAPIPipeline extends IAPIHandler {
    prependHandler(handler: APIHandlerFunc): IAPIPipeline;
    appendHandler(handler: APIHandlerFunc): IAPIPipeline;
    appendPipeline(other: IAPIPipeline): IAPIPipeline;
    prependPipeline(other: IAPIPipeline): IAPIPipeline;
}

export interface IAPICompiledRoute extends IAPIPipeline {
    readonly path: IAPIRoutingPath;
    readonly apiRoute: IAPIRoute;
    readonly expectedMethod: HttpVerb;
    readonly urlTemplate: string;
    readonly name: string;
    checkForRequestMatch(request: IAPIRequest): IAPIRouteParameters;
}

export interface IAPIRoutingPath {
    urlTemplate: string;
    checkUrl(url: string):IAPIRoutingPath
    hasPipeline(method: HttpVerb): boolean;
    tryGetPipeline(method: HttpVerb): IAPIPipeline;
    ensureForPipeline(method: HttpVerb): IAPIPipeline;
    get(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    post(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    put(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    del(...handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    options(handlerFunc: APIHandlerFunc[]):IAPIRoutingPath;
    all(...handlerFunc: APIHandlerFunc[]): IAPIRoutingPath;
}

export interface IAPIRouter extends IAPIHandler {
    forPath(urlTemplate: string): IAPIRoutingPath;
    get(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    post(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    put(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    del(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    options(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
    all(url: string, ...func:APIHandlerFunc[]): IAPIRouter;
}
