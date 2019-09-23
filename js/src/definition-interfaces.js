"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIValueType;
(function (APIValueType) {
    APIValueType["Any"] = "any";
    APIValueType["Null"] = "null";
    APIValueType["String"] = "string";
    APIValueType["Boolean"] = "bool";
    APIValueType["Integer"] = "int";
    APIValueType["Float"] = "float";
    APIValueType["Date"] = "date";
    APIValueType["Choice"] = "choice";
    APIValueType["Array"] = "array";
    APIValueType["Object"] = "object";
})(APIValueType = exports.APIValueType || (exports.APIValueType = {}));
var APIValueSourceType;
(function (APIValueSourceType) {
    APIValueSourceType["Route"] = "route";
    APIValueSourceType["Path"] = "path";
    APIValueSourceType["QueryString"] = "query";
    APIValueSourceType["Headers"] = "headers";
    APIValueSourceType["Body"] = "body";
})(APIValueSourceType = exports.APIValueSourceType || (exports.APIValueSourceType = {}));
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["GET"] = "GET";
    HttpVerb["POST"] = "POST";
    HttpVerb["PUT"] = "PUT";
    HttpVerb["DELETE"] = "DELETE";
    HttpVerb["OPTIONS"] = "OPTIONS";
    HttpVerb["ALL"] = "ALL";
})(HttpVerb = exports.HttpVerb || (exports.HttpVerb = {}));
var APIModuleCreationMethod;
(function (APIModuleCreationMethod) {
    APIModuleCreationMethod["ConstructorCall"] = "constructor";
    APIModuleCreationMethod["FunctionCall"] = "function";
    APIModuleCreationMethod["ModuleResult"] = "module";
})(APIModuleCreationMethod = exports.APIModuleCreationMethod || (exports.APIModuleCreationMethod = {}));
//# sourceMappingURL=definition-interfaces.js.map