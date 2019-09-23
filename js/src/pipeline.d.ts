/// <reference types="node" />
import { APIHandlerFunc, APIRequestBodyMode, APIResultAction, HttpStatusCode, IAPICompiledRoute, IAPIError, IAPIPipeline, IAPIRequest, IAPIRequestQuery, IAPIResponder, IAPIResponse, IAPIResult, IAPIRouteParameters, IAPIUserReference, IHttpFormData } from './api-interfaces';
import { HttpVerb } from "./definition-interfaces";
export declare class APIResponder implements IAPIResponder, IAPIResult, IAPIResponse {
    action: APIResultAction;
    status?: HttpStatusCode;
    headers: {
        [name: string]: string | string[];
    };
    headersSent: boolean;
    body: any;
    getContentType(): string;
    setContentType(contentType: string): APIResponder;
    getContentLength(): number;
    setContentLength(length: number): APIResponder;
    next(): Promise<APIResponder>;
    done(): Promise<APIResponder>;
    buffer(content: Buffer, contentType?: string, status?: HttpStatusCode): Promise<IAPIResult>;
    json(value: any): Promise<IAPIResult>;
    html(content: string): Promise<IAPIResult>;
    protected _sendStatusResponse(status: HttpStatusCode, action: APIResultAction, error: IAPIError): Promise<IAPIResult>;
    forbidden(error?: IAPIError): Promise<IAPIResult>;
    notFound(error?: IAPIError): Promise<IAPIResult>;
    noContent(): Promise<IAPIResult>;
    redirect(url: string, permanent?: boolean): Promise<IAPIResult>;
}
export declare class APIException extends Error {
    response: IAPIResponse;
    request: IAPIRequest;
    constructor(request: IAPIRequest, response: IAPIResponse);
}
export declare class APIPipeline implements IAPIPipeline {
    private _handlers;
    appendHandler(handler: APIHandlerFunc): IAPIPipeline;
    prependHandler(handler: APIHandlerFunc): IAPIPipeline;
    appendPipeline(other: IAPIPipeline): IAPIPipeline;
    prependPipeline(other: IAPIPipeline): IAPIPipeline;
    private _callAction;
    callback(): APIHandlerFunc;
}
export declare class APIRequest implements IAPIRequest {
    constructor(method: HttpVerb, url: string, matchedRoute: IAPICompiledRoute, routeParameters?: IAPIRouteParameters, body?: any, headers?: {
        [name: string]: string | string[];
    }, requestId?: string);
    readonly authorization: string;
    body: any;
    bodyType: APIRequestBodyMode;
    headers: {
        [p: string]: string | string[];
    };
    matchedRoute: IAPICompiledRoute;
    method: HttpVerb;
    parameters: IAPIRouteParameters;
    path: string;
    query: IAPIRequestQuery;
    requestId: string;
    url: string;
    user: IAPIUserReference;
    protected ensureBodyParsed(expectedType: APIRequestBodyMode): void;
    getBinaryBody(): Buffer;
    getContentLength(): number;
    getContentType(): string;
    getFormValues(): IHttpFormData;
    getJSON(): Object;
    getJSONBody<T>(): T;
    setContentLength(length: number): APIRequest;
    setContentType(contentType: string): APIRequest;
    setBodyToBuffer(body: Buffer): APIRequest;
    setBodyToJSON(parsedBody: Object): APIRequest;
    setBodyToModel<T>(parsedBody: T): APIRequest;
}
//# sourceMappingURL=pipeline.d.ts.map