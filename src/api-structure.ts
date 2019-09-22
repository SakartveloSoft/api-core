import {
    APIModuleCreationMethod,
    APIValueSourceType,
    APIValueType,
    HttpVerb,
    IAPIChoiceOption,
    IAPIGroup,
    IAPIModuleEntryDefinition,
    IAPINode,
    IAPIParameter,
    IAPIPropertyDescriptor,
    IAPIRoute,
    IAPIStructure,
    IAPITypeSchema,
    IAPITypesResolver,
    IAPIValidationRules
} from './api-interfaces';


export class APITypesResolver implements IAPITypesResolver {
    private _typesMap: {[name:string]: APITypeSchema } = {};
    constructor() {
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
    public resolveType(typeAlias: string): APITypeSchema {
        let cleanAlias = typeAlias.trim().toLowerCase();
        let type =  this._typesMap[cleanAlias] || null;
        if (!type) {
            throw new Error(`Unknown type alias ${typeAlias}`);
        }
        return type;
    }
    public addTypeByDefinition(alias: string, definition: IAPITypeSchema) {
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
    public addOrResolveTypeSchemaForCollection(typeAlias?: string, typeSchema?: IAPITypeSchema) {
        if (typeAlias) {
            return this.resolveType(typeAlias);
        } else if (typeSchema) {
            return  typeSchema.typeAlias ? this.addTypeByDefinition(typeSchema.typeAlias, typeSchema) : new APITypeSchema(typeSchema, this);
        } else {
            return this.resolveType('any');
        }
    }

}


export class APIChoiceOption implements IAPIChoiceOption {
    public label: string;
    public value: (string|number|boolean|Date|null);
    constructor(definition:IAPIChoiceOption) {
        this.label = definition.label;
        this.value = definition.value === undefined ? null : definition.value;
    }
}

export class APITypeSchema implements IAPITypeSchema {
    public typeAlias: string;
    public valueType:APIValueType;
    public choiceList?: APIChoiceOption[];
    public hasChoices: boolean;
    public itemsType: APITypeSchema;
    public itemsTypeAlias?: string;
    public properties: {[name: string]: APIPropertyDescriptor};
    public preventExtraProperties: boolean;
    constructor(definition: IAPITypeSchema, typesResolver: APITypesResolver) {
        this.typeAlias = definition.typeAlias || null;
        this.valueType = definition.valueType || APIValueType.String;
        this.choiceList = definition.choiceList ? definition.choiceList.map(subDef => new APIChoiceOption(subDef)) : null;
        this.hasChoices = !!(this.choiceList && this.choiceList.length);
        this.itemsTypeAlias = definition.itemsTypeAlias;
        if (this.itemsTypeAlias) {
            this.itemsType = typesResolver.resolveType(this.itemsTypeAlias);
        } else if (definition.itemsType) {
            this.itemsType = definition.itemsType.typeAlias ? typesResolver.addTypeByDefinition(definition.itemsType.typeAlias, definition) : new APITypeSchema(definition.itemsType, typesResolver);
        }
        if (this.valueType === APIValueType.Array && !this.itemsType) {
            this.itemsType = typesResolver.resolveType('any');
        }
        this.properties = {};
        if (definition.properties) {
            for(let name in definition.properties) {
                this.properties[name] = new APIPropertyDescriptor(name, definition.properties[name], typesResolver);
            }
        }
        this.preventExtraProperties = !!definition.preventExtraProperties;
    }
}

const PredefinedTypes : {[alias:string]: APITypeSchema } = {
    any: new APITypeSchema({
        typeAlias: 'any',
        valueType: APIValueType.Any
    }, null),
    string: new APITypeSchema({
        typeAlias: 'string',
        valueType: APIValueType.String,
    }, null),
    boolean: new APITypeSchema({
        typeAlias: 'boolean',
        valueType: APIValueType.Boolean,
    }, null),
    datetime: new APITypeSchema({
        typeAlias: 'datetime',
        valueType: APIValueType.Date,
    }, null),
    integer: new APITypeSchema({
        typeAlias: 'integer',
        valueType: APIValueType.Integer,
    }, null),
    float: new APITypeSchema({
        typeAlias: 'float',
        valueType: APIValueType.Float,
    }, null),

};


export class APIValidableElement implements IAPIValidationRules {
    public required: boolean;
    public minLength?: number;
    public min?: number|Date;
    public max?: number|Date;
    constructor(definition: IAPIValidationRules) {
        this.required = definition.required || false;
        this.minLength = typeof definition.minLength === "number" && definition.minLength > 0 ? definition.minLength : 0;
        this.min = definition.min !== undefined && definition.min !== null ? definition.min : null;
        this.max = definition.max !== undefined && definition.min !== null ? definition.max : null;
    }
}

export class APIPropertyDescriptor extends APIValidableElement implements IAPIPropertyDescriptor {
    public name: string;
    public isMapName : boolean;
    public valueSchema: APITypeSchema;
    public valueSchemaAlias: string;
    public defaultValue: any;
    constructor(name: string, definition: IAPIPropertyDescriptor, typesResolver: APITypesResolver) {
        super(definition);
        this.name = name || definition.name || '';
        this.isMapName = definition.isMapName || false;
        this.valueSchemaAlias = definition.valueSchemaAlias || null;
        this.valueSchema = typesResolver.addOrResolveTypeSchemaForCollection(definition.valueSchemaAlias, definition.valueSchema);
        this.defaultValue = definition.defaultValue === undefined ? null : definition.defaultValue;
    }
}







export class APIParameter extends APIValidableElement implements IAPIParameter {
    public name?: string;
    public sourceType: APIValueSourceType;
    public valueSchema: APITypeSchema;
    constructor(definition: IAPIParameter, typesResolver:APITypesResolver) {
        super(definition);
        this.name = definition.name;
        this.sourceType = definition.sourceType || APIValueSourceType.Route;
        this.valueSchema = typesResolver.addOrResolveTypeSchemaForCollection(definition.valueSchemaAlias, definition.valueSchema);
    }

}


export class APIGroup implements IAPIGroup {
    public name : string;
    public routePrefix? :string;
    public controller?: string;
    public action?: string;
    public groups?: APIGroup[];
    public routes?: APIRoute[];
    constructor(parent:IAPINode, definition:IAPIGroup, typesResolver: APITypesResolver) {
        this.name = definition.name;
        this.routePrefix = definition.routePrefix;
        this.controller = definition.controller || parent.controller || '';
        this.action = definition.action || parent.action || '';
        this.groups = definition.groups ? definition.groups.map(subDef => new APIGroup(this, subDef, typesResolver)) : null;
        this.routes = definition.routes ? definition.routes.map(subDef => new APIRoute(this, subDef, typesResolver)) : null;
    }
}

export class APIRoute implements IAPIRoute{
    public name: string;
    public controller: string;
    public action: string;
    public routePrefix: string;
    public routeTemplate: string;
    public verb: HttpVerb;
    public parameters: APIParameter[];
    public parent?: IAPINode;
    public responseType: APITypeSchema;
    public errorTypes: {[name: string]:APITypeSchema};
    public hasParameters: boolean;
    constructor(parent:IAPINode, definition:IAPIRoute, typesResolver:APITypesResolver) {
        this.parent = parent;
        this.name = definition.name;
        this.routeTemplate = definition.routeTemplate || '';
        this.routePrefix = definition.routePrefix || parent.routePrefix || '';
        this.verb = definition.verb || HttpVerb.GET;
        this.controller = definition.controller || parent.controller;
        this.action = definition.action;
        this.parameters = definition.parameters ? definition.parameters.map(paramDef => new APIParameter(paramDef, typesResolver)) : null;
        this.hasParameters = this.parameters && this.parameters.length > 0;
        if (definition.responseTypeAlias) {
            this.responseType = typesResolver.resolveType(definition.responseTypeAlias);
        } else if (definition.responseType) {
            this.responseType = definition.responseType.typeAlias ? typesResolver.addTypeByDefinition(definition.responseType.typeAlias, definition.responseType) : new APITypeSchema(definition.responseType, typesResolver);
        } else {
            this.responseType = typesResolver.resolveType('any');
        }
        this.errorTypes = {};
        if (definition.errorTypes) {
            for(let statusCode in definition.errorTypes) {
                let typeDefinition = definition.errorTypes[statusCode];
                if (typeof(typeDefinition) === 'string') {
                    this.errorTypes[statusCode] = typesResolver.resolveType(typeDefinition);
                } else if (typeDefinition) {
                    this.errorTypes[statusCode] = typeDefinition.typeAlias ? typesResolver.addTypeByDefinition(typeDefinition.typeAlias, typeDefinition) : new APITypeSchema(typeDefinition, typesResolver);
                }
            }
        }
    }
}


export class APIModuleEntry implements IAPIModuleEntryDefinition {
    private api: APIStructure;
    public name: string;
    public path: string;
    public creationMethod: APIModuleCreationMethod;
    public singleton: boolean;
    constructor(api: APIStructure, name:string, definition: IAPIModuleEntryDefinition) {
        this.api = api;
        this.name = name;
        this.path = definition.path;
        this.creationMethod = definition.creationMethod || APIModuleCreationMethod.ConstructorCall;
        this.singleton = definition.singleton || false;
    }
}



export class APIStructure {
    public name: string;
    public pathRoot: string;
    public version: string;
    public groups: APIGroup[];
    public routes: APIRoute[];
    public defaultResponseType: APITypeSchema;
    public errorTypes: {[status: number]: APITypeSchema};
    public modules:{[name:string]: APIModuleEntry };
    private _types:APITypesResolver = new APITypesResolver();
    constructor(definition:IAPIStructure) {
        this.name = definition.name || 'API';
        this.pathRoot = definition.pathRoot || '/';
        this.version = definition.version;
        if (definition.types) {
            for(let alias in definition.types) {
                let typeDef = definition.types[alias];
                if (typeDef) {
                    this._types.addTypeByDefinition(alias, typeDef);
                }
            }
        }
        if (typeof (definition.defaultResponseType) === "string") {
            this.defaultResponseType = this._types.resolveType(definition.defaultResponseType);
        } else if (definition.defaultResponseType) {
            this.defaultResponseType = definition.defaultResponseType.typeAlias
                ? this._types.addTypeByDefinition(definition.defaultResponseType.typeAlias, definition.defaultResponseType)
                : new APITypeSchema(definition.defaultResponseType, this._types);
        }
        if (this.defaultResponseType) {
            this.defaultResponseType = this._types.resolveType('any');
        }
        this.defaultResponseType =  definition.defaultResponseType ? new APITypeSchema(definition.defaultResponseType, this._types): null;
        this.errorTypes = {};
        if (definition.errorTypes) {
            for(let statusCode in definition.errorTypes) {
                let typeDefinition = definition.errorTypes[statusCode];
                if (typeof(typeDefinition) === 'string') {
                    this.errorTypes[statusCode] = this._types.resolveType(typeDefinition);
                } else if (typeDefinition) {
                    this.errorTypes[statusCode] = typeDefinition.typeAlias ? this._types.addTypeByDefinition(typeDefinition.typeAlias, typeDefinition): new APITypeSchema(typeDefinition, this._types);
                }
            }
        }
        this.groups = definition.groups ? definition.groups.map((groupDefinition:IAPIGroup) => new APIGroup(this, groupDefinition, this._types)) : [];
        this.routes = definition.routes ? definition.routes.map((routeDefinition: IAPIRoute) => new APIRoute(this, routeDefinition, this._types)) : [];
        this.modules = {};
        if (definition.modules) {
            for(let name in definition.modules) {
                let entry = definition.modules[name];
                this.modules[name] = new APIModuleEntry(this, name, entry);
            }
        }
    }
}

export function defineAPIStructure(definition: IAPIStructure|any):APIStructure {
    return new APIStructure(definition);
}