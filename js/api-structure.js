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
})(APIValueType || (APIValueType = {}));
class APIChoiceOption {
    constructor(definition) {
        this.label = definition.label;
        this.value = definition.value === undefined ? null : definition.value;
    }
}
class APITypeSchema {
    constructor(definition) {
        this.valueType = definition.valueType || APIValueType.String;
        this.choiceList = definition.choiceList ? definition.choiceList.map(subDef => new APIChoiceOption(subDef)) : null;
        this.hasChoices = !!(this.choiceList && this.choiceList.length);
        this.itemsType = definition.itemsType ? new APITypeSchema(definition.itemsType) : null;
        if (this.valueType === APIValueType.Array && !this.itemsType) {
            this.itemsType = new APITypeSchema({ valueType: APIValueType.Any });
        }
        this.properties = {};
        if (definition.properties) {
            for (let name in definition.properties) {
                this.properties[name] = new APIPropertyDescriptor(name, definition.properties[name]);
            }
        }
    }
}
class APIValidableElement {
    constructor(definition) {
        this.required = definition.required || false;
        this.minLength = typeof definition.minLength === "number" && definition.minLength > 0 ? definition.minLength : 0;
        this.min = definition.min !== undefined && definition.min !== null ? definition.min : null;
        this.max = definition.max !== undefined && definition.min !== null ? definition.max : null;
    }
}
class APIPropertyDescriptor extends APIValidableElement {
    constructor(name, definition) {
        super(definition);
        this.name = name || definition.name || '';
        this.isMapName = definition.isMapName || false;
        this.valueType = new APITypeSchema(definition.valueType);
        this.defaultValue = definition.defaultValue === undefined ? null : definition.defaultValue;
    }
}
var APIValueSourceType;
(function (APIValueSourceType) {
    APIValueSourceType["Route"] = "route";
    APIValueSourceType["Path"] = "path";
    APIValueSourceType["QueryString"] = "query";
    APIValueSourceType["Headers"] = "headers";
    APIValueSourceType["Body"] = "body";
})(APIValueSourceType || (APIValueSourceType = {}));
class APIParameter extends APIValidableElement {
    constructor(definition) {
        super(definition);
        this.name = definition.name;
        this.sourceType = definition.sourceType || APIValueSourceType.Route;
        this.valueType = definition.valueType ? new APITypeSchema(definition.valueType) : new APITypeSchema({ valueType: APIValueType.Any });
    }
}
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["GET"] = "GET";
    HttpVerb["POST"] = "POST";
    HttpVerb["PUT"] = "PUT";
    HttpVerb["DELETE"] = "DELETE";
    HttpVerb["OPTIONS"] = "OPTIONS";
    HttpVerb["ALL"] = "ALL";
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
        this.parameters = definition.parameters ? definition.parameters.map(paramDef => new APIParameter(paramDef)) : null;
        this.hasParameters = this.parameters && this.parameters.length > 0;
        this.responseType = definition.responseType ? new APITypeSchema(definition.responseType) : new APITypeSchema({ valueType: APIValueType.Any });
        this.errorTypes = {};
        if (definition.errorTypes) {
            for (let statusCode in definition.errorTypes) {
                this.errorTypes[statusCode] = new APITypeSchema(definition.errorTypes[statusCode]);
            }
        }
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
        this.defaultResponseType = definition.defaultResponseType ? new APITypeSchema(definition.defaultResponseType) : null;
        this.errorTypes = {};
        if (definition.errorTypes) {
            for (let statusCode in definition.errorTypes) {
                this.errorTypes[statusCode] = new APITypeSchema(definition.errorTypes[statusCode]);
            }
        }
    }
}
function defineAPIStructure(definition) {
    return new APIStructure(definition);
}
exports.defineAPIStructure = defineAPIStructure;
//# sourceMappingURL=api-structure.js.map