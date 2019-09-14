"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var APIValueType;
(function (APIValueType) {
    APIValueType[APIValueType["Null"] = 0] = "Null";
    APIValueType[APIValueType["String"] = 1] = "String";
    APIValueType[APIValueType["Boolean"] = 2] = "Boolean";
    APIValueType[APIValueType["Integer"] = 3] = "Integer";
    APIValueType[APIValueType["Float"] = 4] = "Float";
    APIValueType[APIValueType["Date"] = 5] = "Date";
    APIValueType[APIValueType["Choice"] = 6] = "Choice";
    APIValueType[APIValueType["Array"] = 7] = "Array";
    APIValueType[APIValueType["Object"] = 8] = "Object";
})(APIValueType || (APIValueType = {}));
var APIValueSourceType;
(function (APIValueSourceType) {
    APIValueSourceType[APIValueSourceType["Route"] = 0] = "Route";
    APIValueSourceType[APIValueSourceType["Path"] = 1] = "Path";
    APIValueSourceType[APIValueSourceType["QueryString"] = 2] = "QueryString";
    APIValueSourceType[APIValueSourceType["Headers"] = 3] = "Headers";
    APIValueSourceType[APIValueSourceType["Body"] = 4] = "Body";
})(APIValueSourceType || (APIValueSourceType = {}));
var HttpVerb;
(function (HttpVerb) {
    HttpVerb[HttpVerb["GET"] = 0] = "GET";
    HttpVerb[HttpVerb["POST"] = 1] = "POST";
    HttpVerb[HttpVerb["PUT"] = 2] = "PUT";
    HttpVerb[HttpVerb["DELETE"] = 3] = "DELETE";
    HttpVerb[HttpVerb["OPTIONS"] = 4] = "OPTIONS";
    HttpVerb[HttpVerb["ALL"] = 5] = "ALL";
})(HttpVerb || (HttpVerb = {}));
class APIGroup {
    constructor(parent, definition) {
        this.name = definition.name;
        this.routePrefix = definition.routePrefix;
        this.controller = definition.controller || parent.controller || '';
        this.action = definition.action || parent.action || '';
        this.groups = definition.groups ? definition.groups.map(subDef => new APIGroup(this, subDef)) : null;
        this.routes = definition.routes ? definition.routes.map(subDef => new APIRoute(this, subDef)) : null;
    }
}
class APIRoute {
    constructor(parent, definition) {
        this.parent = parent;
        this.name = definition.name;
        this.routeTemplate = definition.routeTemplate || '';
        this.routePrefix = definition.routePrefix || parent.routePrefix || '';
        this.verb = definition.verb || HttpVerb.GET;
        this.controller = definition.controller || parent.controller;
        this.action = definition.action;
    }
}
var APIModuleCreationMethod;
(function (APIModuleCreationMethod) {
    APIModuleCreationMethod[APIModuleCreationMethod["ConstructorCall"] = 0] = "ConstructorCall";
    APIModuleCreationMethod[APIModuleCreationMethod["FunctionCall"] = 1] = "FunctionCall";
    APIModuleCreationMethod[APIModuleCreationMethod["ModuleResult"] = 2] = "ModuleResult";
})(APIModuleCreationMethod || (APIModuleCreationMethod = {}));
class APIModuleEntry {
    constructor(api, name, definition) {
        this.api = api;
        this.name = name;
        this.path = definition.path;
        this.creationMethod = definition.creationMethod || APIModuleCreationMethod.ConstructorCall;
        this.singleton = definition.singleton || false;
    }
}
class APIStructure {
    constructor(definition) {
        this.name = definition.name || 'API';
        this.pathRoot = definition.pathRoot || '/';
        this.version = definition.version;
        this.groups = definition.groups ? definition.groups.map((groupDefinition) => new APIGroup(this, groupDefinition)) : [];
        this.routes = definition.routes ? definition.routes.map((routeDefinition) => new APIRoute(this, routeDefinition)) : [];
        this.modules = {};
        if (definition.modules) {
            for (let name in definition.modules) {
                let entry = definition.modules[name];
                this.modules[name] = new APIModuleEntry(this, name, entry);
            }
        }
    }
}
function defineAPIStructure(definition) {
    return new APIStructure(definition);
}
exports.defineAPIStructure = defineAPIStructure;
//# sourceMappingURL=api-structure.js.map