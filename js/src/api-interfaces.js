"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIRequestBodyMode;
(function (APIRequestBodyMode) {
    APIRequestBodyMode["NotParsed"] = "unknown";
    APIRequestBodyMode["JSON"] = "json";
    APIRequestBodyMode["WebForm"] = "webForm";
    APIRequestBodyMode["Multipart"] = "multipart";
    APIRequestBodyMode["RawBuffer"] = "rawBuffer";
})(APIRequestBodyMode = exports.APIRequestBodyMode || (exports.APIRequestBodyMode = {}));
var HttpStatusCode;
(function (HttpStatusCode) {
    HttpStatusCode[HttpStatusCode["Continue"] = 100] = "Continue";
    HttpStatusCode[HttpStatusCode["Ok"] = 200] = "Ok";
    HttpStatusCode[HttpStatusCode["Created"] = 201] = "Created";
    HttpStatusCode[HttpStatusCode["NoContent"] = 204] = "NoContent";
    HttpStatusCode[HttpStatusCode["PartialContent"] = 206] = "PartialContent";
    HttpStatusCode[HttpStatusCode["PermanentRedirect"] = 301] = "PermanentRedirect";
    HttpStatusCode[HttpStatusCode["TemporaryRedirect"] = 302] = "TemporaryRedirect";
    HttpStatusCode[HttpStatusCode["BadRequest"] = 400] = "BadRequest";
    HttpStatusCode[HttpStatusCode["Forbidden"] = 403] = "Forbidden";
    HttpStatusCode[HttpStatusCode["NotFound"] = 404] = "NotFound";
    HttpStatusCode[HttpStatusCode["ServerError"] = 500] = "ServerError";
    HttpStatusCode[HttpStatusCode["NotImplemented"] = 501] = "NotImplemented";
})(HttpStatusCode = exports.HttpStatusCode || (exports.HttpStatusCode = {}));
var APIResultAction;
(function (APIResultAction) {
    APIResultAction["Done"] = "done";
    APIResultAction["CallNext"] = "callNext";
    APIResultAction["SendHeadersOnly"] = "sendHeadersOnly";
    APIResultAction["ReportError"] = "error";
    APIResultAction["SendJSON"] = "sendJSON";
    APIResultAction["SendHtml"] = "sendHtml";
    APIResultAction["SendBuffer"] = "sendBuffer";
    APIResultAction["SendStream"] = "sendStream";
})(APIResultAction = exports.APIResultAction || (exports.APIResultAction = {}));
//# sourceMappingURL=api-interfaces.js.map