"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("./api-interfaces");
class APIChoiceOption {
    constructor(definition) {
        this.label = definition.label;
        this.value = definition.value === undefined ? null : definition.value;
    }
}
exports.APIChoiceOption = APIChoiceOption;
class APITypeSchema {
    constructor(definition) {
        this.valueType = definition.valueType || api_interfaces_1.APIValueType.String;
        this.choiceList = definition.choiceList ? definition.choiceList.map(subDef => new APIChoiceOption(subDef)) : null;
        this.hasChoices = !!(this.choiceList && this.choiceList.length);
        this.itemsType = definition.itemsType ? new APITypeSchema(definition.itemsType) : null;
        if (this.valueType === api_interfaces_1.APIValueType.Array && !this.itemsType) {
            this.itemsType = new APITypeSchema({ valueType: api_interfaces_1.APIValueType.Any });
        }
        this.properties = {};
        if (definition.properties) {
            for (let name in definition.properties) {
                this.properties[name] = new APIPropertyDescriptor(name, definition.properties[name]);
            }
        }
        this.preventExtraProperties = !!definition.preventExtraProperties;
    }
}
exports.APITypeSchema = APITypeSchema;
class APIValidableElement {
    constructor(definition) {
        this.required = definition.required || false;
        this.minLength = typeof definition.minLength === "number" && definition.minLength > 0 ? definition.minLength : 0;
        this.min = definition.min !== undefined && definition.min !== null ? definition.min : null;
        this.max = definition.max !== undefined && definition.min !== null ? definition.max : null;
    }
}
exports.APIValidableElement = APIValidableElement;
class APIPropertyDescriptor extends APIValidableElement {
    constructor(name, definition) {
        super(definition);
        this.name = name || definition.name || '';
        this.isMapName = definition.isMapName || false;
        this.valueType = new APITypeSchema(definition.valueType);
        this.defaultValue = definition.defaultValue === undefined ? null : definition.defaultValue;
    }
}
exports.APIPropertyDescriptor = APIPropertyDescriptor;
class APIParameter extends APIValidableElement {
    constructor(definition) {
        super(definition);
        this.name = definition.name;
        this.sourceType = definition.sourceType || api_interfaces_1.APIValueSourceType.Route;
        this.valueType = definition.valueType ? new APITypeSchema(definition.valueType) : new APITypeSchema({ valueType: api_interfaces_1.APIValueType.Any });
    }
}
exports.APIParameter = APIParameter;
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
exports.APIGroup = APIGroup;
class APIRoute {
    constructor(parent, definition) {
        this.parent = parent;
        this.name = definition.name;
        this.routeTemplate = definition.routeTemplate || '';
        this.routePrefix = definition.routePrefix || parent.routePrefix || '';
        this.verb = definition.verb || api_interfaces_1.HttpVerb.GET;
        this.controller = definition.controller || parent.controller;
        this.action = definition.action;
        this.parameters = definition.parameters ? definition.parameters.map(paramDef => new APIParameter(paramDef)) : null;
        this.hasParameters = this.parameters && this.parameters.length > 0;
        this.responseType = definition.responseType ? new APITypeSchema(definition.responseType) : new APITypeSchema({ valueType: api_interfaces_1.APIValueType.Any });
        this.errorTypes = {};
        if (definition.errorTypes) {
            for (let statusCode in definition.errorTypes) {
                this.errorTypes[statusCode] = new APITypeSchema(definition.errorTypes[statusCode]);
            }
        }
    }
}
exports.APIRoute = APIRoute;
class APIModuleEntry {
    constructor(api, name, definition) {
        this.api = api;
        this.name = name;
        this.path = definition.path;
        this.creationMethod = definition.creationMethod || api_interfaces_1.APIModuleCreationMethod.ConstructorCall;
        this.singleton = definition.singleton || false;
    }
}
exports.APIModuleEntry = APIModuleEntry;
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
exports.APIStructure = APIStructure;
function defineAPIStructure(definition) {
    return new APIStructure(definition);
}
exports.defineAPIStructure = defineAPIStructure;
//# sourceMappingURL=api-structure.js.map