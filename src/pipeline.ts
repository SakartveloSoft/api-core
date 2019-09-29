import {
    APIHandlerFunc,
    APIRequestBodyMode,
    APIResultAction,
    HttpStatusCode,
    IAPICompiledRoute,
    IAPIError,
    IAPIPipeline,
    IAPIRequest,
    IAPIRequestQuery,
    IAPIResponder,
    IAPIResponse,
    IAPIResult,
    IAPIRouteParameters,
    IAPIUserReference,
    IHttpFormData
} from './api-interfaces';

import { HttpVerb} from "./definition-interfaces";





export class APIResponder implements IAPIResponder, IAPIResult, IAPIResponse {
    public action: APIResultAction = APIResultAction.CallNext;
    public status?: HttpStatusCode;
    public headers : {[name: string]: string|string[]};
    public headersSent: boolean = false;
    public body: any;
    public getContentType(): string {
        let value = this.headers['content-type'];
        if (value && Array.isArray(value)) {
            return value.join(', ');
        } else if (typeof (value) === 'string') {
            return value;
        } else {
            return value ? null : value.toString();
        }
    }

    setContentType(contentType: string): APIResponder {
        this.headers['content-type'] = contentType;
        return this;
    }

    public getContentLength(): number {
        let value = this.headers['content-length'];
        return value ? parseInt(Array.isArray(value) ? value[0] : value) : 0;
    }
    public setContentLength(length: number): APIResponder {
        this.headers['content-length'] = length.toString();
        return this;
    }
    public next(): Promise<APIResponder> {
        this.action = APIResultAction.CallNext;
        return Promise.resolve(this);
    }

    public done(): Promise<APIResponder> {
        this.action = APIResultAction.Done;
        return Promise.resolve(this);
    }

    public buffer(content: Buffer, contentType?: string, status?: HttpStatusCode): Promise<IAPIResult> {
        this.action = APIResultAction.SendBuffer;
        if (status) {
            this.status = status;
        }
        this.setContentLength(content.length);
        if (contentType) {
            this.setContentType(contentType);
        }
        this.body = content;
        return Promise.resolve(this);
    }
    public json(value: any): Promise<IAPIResult> {
        this.action = APIResultAction.SendJSON;
        this.body = value;
        return Promise.resolve(this);
    }
    public html(content: string): Promise<IAPIResult> {
        this.action = APIResultAction.SendHtml;
        this.body = content;
        return Promise.resolve(this);
    }
    protected _sendStatusResponse(status: HttpStatusCode, action: APIResultAction, error: IAPIError):Promise<IAPIResult> {
        this.action = action;
        this.status = status;
        if (error) {
            this.body =  {
                message : error.message,
                stack: error.stack,
                details: error.details
            };
        }
        return Promise.resolve(this);
    }
    public forbidden(error?: IAPIError): Promise<IAPIResult> {
        return this._sendStatusResponse(HttpStatusCode.Forbidden, APIResultAction.ReportError, error);
    }
    public notFound(error?: IAPIError): Promise<IAPIResult> {
        return this._sendStatusResponse(HttpStatusCode.NotFound, APIResultAction.ReportError, error);
    }
    public noContent(): Promise<IAPIResult> {
        this.action = APIResultAction.SendHeadersOnly;
        this.status = HttpStatusCode.NoContent;
        return Promise.resolve(this);
    }
    public redirect(url: string, permanent?: boolean): Promise<IAPIResult> {
        this.action = APIResultAction.SendHeadersOnly;
        this.status = permanent ? HttpStatusCode.PermanentRedirect : HttpStatusCode.TemporaryRedirect;
        this.headers['location'] = encodeURIComponent(url);
        return Promise.resolve(this);
    }
}

export class APIException extends Error {
    public response : IAPIResponse;
    public request: IAPIRequest;
    constructor(request: IAPIRequest, response: IAPIResponse) {
        super(`Error happened during processing ${request.method}  ${request.url} ${request.requestId} ${(response.body && response.body.message) || ''}`);
        Error.captureStackTrace(this, APIException);
    }
}

export class APIPipeline implements IAPIPipeline {
    private _handlers: APIHandlerFunc[] = [];
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
    private _callAction(request: IAPIRequest, responder: IAPIResponder, handler: APIHandlerFunc, nextLayerIndex: number):Promise<IAPIResult> {
        try {
            return Promise.resolve(handler(request, responder)).then(result => {
                if (result === null || result === undefined) {
                    result = responder;
                }
                if (result.action === APIResultAction.Done) {
                    return responder;
                }
                switch (result.action) {
                    case undefined:
                    case APIResultAction.CallNext:
                        if (nextLayerIndex >= this._handlers.length) {
                            return result;
                        }
                        return this._callAction(request, responder, this._handlers[nextLayerIndex], nextLayerIndex + 1);
                    case APIResultAction.ReportError:
                        return Promise.reject(new APIException(request, responder));
                    case APIResultAction.SendJSON:
                    case APIResultAction.SendHtml:
                    case APIResultAction.SendBuffer:
                    case APIResultAction.SendStream:
                    case APIResultAction.SendHeadersOnly:
                        return responder;
                    default:
                        return Promise.reject(new Error(`API action ${responder.action} does not implemented yet`));
                }
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    processRequest(request: IAPIRequest, responder: IAPIResponder): Promise<IAPIResult> {
        if (this._handlers.length === 0) {
            return Promise.resolve(responder.next());
        }
        return this._callAction(request, responder, this._handlers[0], 1);
    }

    callback(): APIHandlerFunc {
        return this.processRequest.bind(this);
    }
}

export class APIRequest implements IAPIRequest {
    constructor(method: HttpVerb, url: string, matchedRoute: IAPICompiledRoute, routeParameters?: IAPIRouteParameters, body?: any, headers?: {[name: string]: string|string[]}, requestId?: string) {
        this.method = method;
        this.url = url;
        this.headers = headers || {};
        this.matchedRoute = matchedRoute || null;
        this.parameters = routeParameters || {};
        this.requestId = requestId;
    }

    public get authorization(): string {
        return (this.headers['authorization'] || '').toString();
    };
    body: any;
    bodyType: APIRequestBodyMode;
    headers: { [p: string]: string | string[] };
    matchedRoute: IAPICompiledRoute;
    method: HttpVerb;
    parameters: IAPIRouteParameters;
    path: string;
    query: IAPIRequestQuery;
    requestId: string;
    url: string;
    user: IAPIUserReference;

    protected ensureBodyParsed(expectedType: APIRequestBodyMode):void {
        if (this.bodyType === APIRequestBodyMode.NotParsed) {
            throw new Error(`Body was not parsed yet for request ${this.requestId}`);
        }
        if (this.bodyType !== expectedType) {
            throw new Error(`Body type ${this.bodyType} for request ${this.requestId} does not natch expected ${expectedType} body type`);
        }
    }
    getBinaryBody(): Buffer {
        this.ensureBodyParsed(APIRequestBodyMode.RawBuffer);
        if (this.body instanceof Buffer) {
            return this.body;
        }
        throw new Error('Body is not a buffer');
    }

    getContentLength(): number {
        return  parseInt((this.headers['content-length'] || '0').toString());
    }

    getContentType(): string {
        return (this.headers['content-type'] || '').toString();
    }

    getFormValues(): IHttpFormData {
        return undefined;
    }

    getJSON(): Object {
        this.ensureBodyParsed(APIRequestBodyMode.JSON);
        return this.body;
    }

    getJSONBody<T>(): T {
        this.ensureBodyParsed(APIRequestBodyMode.JSON);
        return this.body;
    }

    setContentLength(length: number): APIRequest {
        this.headers['content-length'] = length.toString();
        return this;
    }

    setContentType(contentType: string): APIRequest {
        this.headers['content-type'] = contentType;
        return this;
    }

    setBodyToBuffer(body: Buffer): APIRequest {
        this.body = body;
        this.bodyType = APIRequestBodyMode.RawBuffer;
        return this;
    }
    setBodyToJSON(parsedBody: Object): APIRequest {
        this.body = parsedBody;
        this.bodyType = APIRequestBodyMode.JSON;
        return this;
    }
    setBodyToModel<T>(parsedBody: T): APIRequest {
        this.body = parsedBody;
        this.bodyType = APIRequestBodyMode.JSON;
        return this;
    }
}

