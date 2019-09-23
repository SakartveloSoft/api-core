"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("./api-interfaces");
class APIResponder {
    constructor() {
        this.action = api_interfaces_1.APIResultAction.CallNext;
        this.headersSent = false;
    }
    getContentType() {
        let value = this.headers['content-type'];
        if (value && Array.isArray(value)) {
            return value.join(', ');
        }
        else if (typeof (value) === 'string') {
            return value;
        }
        else {
            return value ? null : value.toString();
        }
    }
    setContentType(contentType) {
        this.headers['content-type'] = contentType;
        return this;
    }
    getContentLength() {
        let value = this.headers['content-length'];
        return value ? parseInt(Array.isArray(value) ? value[0] : value) : 0;
    }
    setContentLength(length) {
        this.headers['content-length'] = length.toString();
        return this;
    }
    next() {
        this.action = api_interfaces_1.APIResultAction.CallNext;
        return Promise.resolve(this);
    }
    done() {
        this.action = api_interfaces_1.APIResultAction.Done;
        return Promise.resolve(this);
    }
    buffer(content, contentType, status) {
        this.action = api_interfaces_1.APIResultAction.SendBuffer;
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
    json(value) {
        this.action = api_interfaces_1.APIResultAction.SendJSON;
        this.body = value;
        return Promise.resolve(this);
    }
    html(content) {
        this.action = api_interfaces_1.APIResultAction.SendHtml;
        this.body = content;
        return Promise.resolve(this);
    }
    _sendStatusResponse(status, action, error) {
        this.action = action;
        this.status = status;
        if (error) {
            this.body = {
                message: error.message,
                stack: error.stack,
                details: error.details
            };
        }
        return Promise.resolve(this);
    }
    forbidden(error) {
        return this._sendStatusResponse(api_interfaces_1.HttpStatusCode.Forbidden, api_interfaces_1.APIResultAction.ReportError, error);
    }
    notFound(error) {
        return this._sendStatusResponse(api_interfaces_1.HttpStatusCode.NotFound, api_interfaces_1.APIResultAction.ReportError, error);
    }
    noContent() {
        this.action = api_interfaces_1.APIResultAction.SendHeadersOnly;
        this.status = api_interfaces_1.HttpStatusCode.NoContent;
        return Promise.resolve(this);
    }
    redirect(url, permanent) {
        this.action = api_interfaces_1.APIResultAction.SendHeadersOnly;
        this.status = permanent ? api_interfaces_1.HttpStatusCode.PermanentRedirect : api_interfaces_1.HttpStatusCode.TemporaryRedirect;
        this.headers['location'] = encodeURIComponent(url);
        return Promise.resolve(this);
    }
}
exports.APIResponder = APIResponder;
class APIException extends Error {
    constructor(request, response) {
        super(`Error happened during processing ${request.method}  ${request.url} ${request.requestId} ${(response.body && response.body.message) || ''}`);
        Error.captureStackTrace(this, APIException);
    }
}
exports.APIException = APIException;
class APIPipeline {
    appendHandler(handler) {
        this._handlers.push(handler);
        return this;
    }
    prependHandler(handler) {
        this._handlers.splice(0, 0, handler);
        return this;
    }
    appendPipeline(other) {
        return this.appendHandler(other.callback());
    }
    prependPipeline(other) {
        return this.appendHandler(other.callback());
    }
    _callAction(request, responder, handler, nextLayerIndex) {
        try {
            return Promise.resolve(handler(request, responder)).then(result => {
                if (result === null || result === undefined) {
                    result = responder;
                }
                if (result.action === api_interfaces_1.APIResultAction.Done) {
                    return responder;
                }
                switch (result.action) {
                    case undefined:
                    case api_interfaces_1.APIResultAction.CallNext:
                        if (nextLayerIndex >= this._handlers.length) {
                            return result;
                        }
                        return this._callAction(request, responder, this._handlers[nextLayerIndex], nextLayerIndex + 1);
                    case api_interfaces_1.APIResultAction.ReportError:
                        return Promise.reject(new APIException(request, responder));
                    case api_interfaces_1.APIResultAction.SendJSON:
                    case api_interfaces_1.APIResultAction.SendHtml:
                    case api_interfaces_1.APIResultAction.SendBuffer:
                    case api_interfaces_1.APIResultAction.SendStream:
                    case api_interfaces_1.APIResultAction.SendHeadersOnly:
                        return responder;
                    default:
                        return Promise.reject(new Error(`API action ${responder.action} does not implemented yet`));
                }
            });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
    callback() {
        return (request, responder) => {
            if (this._handlers.length === 0) {
                return Promise.resolve(responder.next());
            }
            return this._callAction(request, responder, this._handlers[0], 1);
        };
    }
}
exports.APIPipeline = APIPipeline;
class APIRequest {
    constructor(method, url, matchedRoute, routeParameters, body, headers, requestId) {
        this.method = method;
        this.url = url;
        this.headers = headers || {};
        this.matchedRoute = matchedRoute || null;
        this.parameters = routeParameters || {};
        this.requestId = requestId;
    }
    get authorization() {
        return (this.headers['authorization'] || '').toString();
    }
    ;
    ensureBodyParsed(expectedType) {
        if (this.bodyType === api_interfaces_1.APIRequestBodyMode.NotParsed) {
            throw new Error(`Body was not parsed yet for request ${this.requestId}`);
        }
        if (this.bodyType !== expectedType) {
            throw new Error(`Body type ${this.bodyType} for request ${this.requestId} does not natch expected ${expectedType} body type`);
        }
    }
    getBinaryBody() {
        this.ensureBodyParsed(api_interfaces_1.APIRequestBodyMode.RawBuffer);
        if (this.body instanceof Buffer) {
            return this.body;
        }
        throw new Error('Body is not a buffer');
    }
    getContentLength() {
        return parseInt((this.headers['content-length'] || '0').toString());
    }
    getContentType() {
        return (this.headers['content-type'] || '').toString();
    }
    getFormValues() {
        return undefined;
    }
    getJSON() {
        this.ensureBodyParsed(api_interfaces_1.APIRequestBodyMode.JSON);
        return this.body;
    }
    getJSONBody() {
        this.ensureBodyParsed(api_interfaces_1.APIRequestBodyMode.JSON);
        return this.body;
    }
    setContentLength(length) {
        this.headers['content-length'] = length.toString();
        return this;
    }
    setContentType(contentType) {
        this.headers['content-type'] = contentType;
        return this;
    }
    setBodyToBuffer(body) {
        this.body = body;
        this.bodyType = api_interfaces_1.APIRequestBodyMode.RawBuffer;
        return this;
    }
    setBodyToJSON(parsedBody) {
        this.body = parsedBody;
        this.bodyType = api_interfaces_1.APIRequestBodyMode.JSON;
        return this;
    }
    setBodyToModel(parsedBody) {
        this.body = parsedBody;
        this.bodyType = api_interfaces_1.APIRequestBodyMode.JSON;
        return this;
    }
}
exports.APIRequest = APIRequest;
//# sourceMappingURL=pipeline.js.map