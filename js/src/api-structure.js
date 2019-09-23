"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const definition_interfaces_1 = require("./definition-interfaces");
class APITypesResolver {
    constructor() {
        this._typesMap = {};
        this._typesMap['any'] = PredefinedTypes['any'];
        this._typesMap['string'] = PredefinedTypes['string'];
        this._typesMap['boolean'] = PredefinedTypes['boolean'];
        this._typesMap['bool'] = PredefinedTypes['boolean'];
        this._typesMap['datetime'] = PredefinedTypes['datetime'];
        this._typesMap['date'] = PredefinedTypes['datetime'];
        this._typesMap['integer'] = PredefinedTypes['integer'];
        this._typesMap['int'] = PredefinedTypes['integer'];
        this._typesMap['float'] = PredefinedTypes['float'];
        this._typesMap['number'] = PredefinedTypes['float'];
    }
    resolveType(typeAlias) {
        let cleanAlias = typeAlias.trim().toLowerCase();
        let type = this._typesMap[cleanAlias] || null;
        if (!type) {
            throw new Error(`Unknown type alias ${typeAlias}`);
        }
        return type;
    }
    addTypeByDefinition(alias, definition) {
        if (!alias) {
            alias = definition.typeAlias;
        }
        if (!alias) {
            throw new Error('No alias provided for type at schema registration');
        }
        alias = alias.toLowerCase().trim();
        if (this._typesMap.hasOwnProperty(alias)) {
            throw new Error(`Type schema ${alias} already registered`);
        }
        let schema = new APITypeSchema(definition, this);
        this._typesMap[alias] = schema;
        return schema;
    }
    addOrResolveTypeSchemaForCollection(typeAlias, typeSchema) {
        if (typeAlias) {
            return this.resolveType(typeAlias);
        }
        else if (typeSchema) {
            return typeSchema.typeAlias ? this.addTypeByDefinition(typeSchema.typeAlias, typeSchema) : new APITypeSchema(typeSchema, this);
        }
        else {
            return this.resolveType('any');
        }
    }
}
exports.APITypesResolver = APITypesResolver;
class APIChoiceOption {
    constructor(definition) {
        this.label = definition.label;
        this.value = definition.value === undefined ? null : definition.value;
    }
}
exports.APIChoiceOption = APIChoiceOption;
class APITypeSchema {
    constructor(definition, typesResolver) {
        this.typeAlias = definition.typeAlias || null;
        this.valueType = definition.valueType || definition_interfaces_1.APIValueType.String;
        this.choiceList = definition.choiceList ? definition.choiceList.map(subDef => new APIChoiceOption(subDef)) : null;
        this.hasChoices = !!(this.choiceList && this.choiceList.length);
        this.itemsTypeAlias = definition.itemsTypeAlias;
        if (this.itemsTypeAlias) {
            this.itemsType = typesResolver.resolveType(this.itemsTypeAlias);
        }
        else if (definition.itemsType) {
            this.itemsType = definition.itemsType.typeAlias ? typesResolver.addTypeByDefinition(definition.itemsType.typeAlias, definition) : new APITypeSchema(definition.itemsType, typesResolver);
        }
        if (this.valueType === definition_interfaces_1.APIValueType.Array && !this.itemsType) {
            this.itemsType = typesResolver.resolveType('any');
        }
        this.properties = {};
        if (definition.properties) {
            for (let name in definition.properties) {
                this.properties[name] = new APIPropertyDescriptor(name, definition.properties[name], typesResolver);
            }
        }
        this.preventExtraProperties = !!definition.preventExtraProperties;
    }
}
exports.APITypeSchema = APITypeSchema;
const PredefinedTypes = {
    any: new APITypeSchema({
        typeAlias: 'any',
        valueType: definition_interfaces_1.APIValueType.Any
    }, null),
    string: new APITypeSchema({
        typeAlias: 'string',
        valueType: definition_interfaces_1.APIValueType.String,
    }, null),
    boolean: new APITypeSchema({
        typeAlias: 'boolean',
        valueType: definition_interfaces_1.APIValueType.Boolean,
    }, null),
    datetime: new APITypeSchema({
        typeAlias: 'datetime',
        valueType: definition_interfaces_1.APIValueType.Date,
    }, null),
    integer: new APITypeSchema({
        typeAlias: 'integer',
        valueType: definition_interfaces_1.APIValueType.Integer,
    }, null),
    float: new APITypeSchema({
        typeAlias: 'float',
        valueType: definition_interfaces_1.APIValueType.Float,
    }, null),
};
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
    constructor(name, definition, typesResolver) {
        super(definition);
        this.name = name || definition.name || '';
        this.isMapName = definition.isMapName || false;
        this.valueSchemaAlias = definition.valueSchemaAlias || null;
        this.valueSchema = typesResolver.addOrResolveTypeSchemaForCollection(definition.valueSchemaAlias, definition.valueSchema);
        this.defaultValue = definition.defaultValue === undefined ? null : definition.defaultValue;
    }
}
exports.APIPropertyDescriptor = APIPropertyDescriptor;
class APIParameter extends APIValidableElement {
    constructor(definition, typesResolver) {
        super(definition);
        this.name = definition.name;
        this.sourceType = definition.sourceType || definition_interfaces_1.APIValueSourceType.Route;
        this.valueSchema = typesResolver.addOrResolveTypeSchemaForCollection(definition.valueSchemaAlias, definition.valueSchema);
    }
}
exports.APIParameter = APIParameter;
class APIGroup {
    constructor(parent, definition, typesResolver) {
        this.name = definition.name;
        this.routePrefix = definition.routePrefix;
        this.controller = definition.controller || parent.controller || '';
        this.action = definition.action || parent.action || '';
        this.groups = definition.groups ? definition.groups.map(subDef => new APIGroup(this, subDef, typesResolver)) : null;
        this.routes = definition.routes ? definition.routes.map(subDef => new APIRoute(this, subDef, typesResolver)) : null;
    }
}
exports.APIGroup = APIGroup;
class APIRoute {
    constructor(parent, definition, typesResolver) {
        this.parent = parent;
        this.name = definition.name;
        this.routeTemplate = definition.routeTemplate || '';
        this.routePrefix = definition.routePrefix || parent.routePrefix || '';
        this.verb = definition.verb || definition_interfaces_1.HttpVerb.GET;
        this.controller = definition.controller || parent.controller;
        this.action = definition.action;
        this.parameters = definition.parameters ? definition.parameters.map(paramDef => new APIParameter(paramDef, typesResolver)) : null;
        this.hasParameters = this.parameters && this.parameters.length > 0;
        if (definition.responseTypeAlias) {
            this.responseType = typesResolver.resolveType(definition.responseTypeAlias);
        }
        else if (definition.responseType) {
            this.responseType = definition.responseType.typeAlias ? typesResolver.addTypeByDefinition(definition.responseType.typeAlias, definition.responseType) : new APITypeSchema(definition.responseType, typesResolver);
        }
        else {
            this.responseType = typesResolver.resolveType('any');
        }
        this.errorTypes = {};
        if (definition.errorTypes) {
            for (let statusCode in definition.errorTypes) {
                let typeDefinition = definition.errorTypes[statusCode];
                if (typeof (typeDefinition) === 'string') {
                    this.errorTypes[statusCode] = typesResolver.resolveType(typeDefinition);
                }
                else if (typeDefinition) {
                    this.errorTypes[statusCode] = typeDefinition.typeAlias ? typesResolver.addTypeByDefinition(typeDefinition.typeAlias, typeDefinition) : new APITypeSchema(typeDefinition, typesResolver);
                }
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
        this.creationMethod = definition.creationMethod || definition_interfaces_1.APIModuleCreationMethod.ConstructorCall;
        this.singleton = definition.singleton || false;
    }
}
exports.APIModuleEntry = APIModuleEntry;
class APIStructure {
    constructor(definition) {
        this._types = new APITypesResolver();
        this.name = definition.name || 'API';
        this.pathRoot = definition.pathRoot || '/';
        this.version = definition.version;
        if (definition.types) {
            for (let alias in definition.types) {
                let typeDef = definition.types[alias];
                if (typeDef) {
                    this._types.addTypeByDefinition(alias, typeDef);
                }
            }
        }
        if (typeof (definition.defaultResponseType) === "string") {
            this.defaultResponseType = this._types.resolveType(definition.defaultResponseType);
        }
        else if (definition.defaultResponseType) {
            this.defaultResponseType = definition.defaultResponseType.typeAlias
                ? this._types.addTypeByDefinition(definition.defaultResponseType.typeAlias, definition.defaultResponseType)
                : new APITypeSchema(definition.defaultResponseType, this._types);
        }
        if (this.defaultResponseType) {
            this.defaultResponseType = this._types.resolveType('any');
        }
        this.defaultResponseType = definition.defaultResponseType ? new APITypeSchema(definition.defaultResponseType, this._types) : null;
        this.errorTypes = {};
        if (definition.errorTypes) {
            for (let statusCode in definition.errorTypes) {
                let typeDefinition = definition.errorTypes[statusCode];
                if (typeof (typeDefinition) === 'string') {
                    this.errorTypes[statusCode] = this._types.resolveType(typeDefinition);
                }
                else if (typeDefinition) {
                    this.errorTypes[statusCode] = typeDefinition.typeAlias ? this._types.addTypeByDefinition(typeDefinition.typeAlias, typeDefinition) : new APITypeSchema(typeDefinition, this._types);
                }
            }
        }
        this.groups = definition.groups ? definition.groups.map((groupDefinition) => new APIGroup(this, groupDefinition, this._types)) : [];
        this.routes = definition.routes ? definition.routes.map((routeDefinition) => new APIRoute(this, routeDefinition, this._types)) : [];
        this.modules = {};
        if (definition.modules) {
            for (let name in definition.modules) {
                let entry = definition.modules[name];
                this.modules[name] = new APIModuleEntry(this, name, entry);
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