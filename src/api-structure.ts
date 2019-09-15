import {IAPIChoiceOption, IAPITypeSchema,  IAPIValidationRules, IAPIParameter, APIValueSourceType, IAPIPropertyDescriptor, APIValueType, IAPIRoute, IAPIModuleEntryDefinition, APIModuleCreationMethod, IAPINode, HttpVerb, IAPIGroup, IAPIStructure } from './api-interfaces';

export class APIChoiceOption implements IAPIChoiceOption {
    public label: string;
    public value: (string|number|boolean|Date|null);
    constructor(definition:IAPIChoiceOption) {
        this.label = definition.label;
        this.value = definition.value === undefined ? null : definition.value;
    }
}

export class APITypeSchema implements IAPITypeSchema {
    public valueType:APIValueType;
    public choiceList?: APIChoiceOption[];
    public hasChoices: boolean;
    public itemsType: APITypeSchema;
    public properties: {[name: string]: APIPropertyDescriptor};
    constructor(definition: IAPITypeSchema) {
        this.valueType = definition.valueType || APIValueType.String;
        this.choiceList = definition.choiceList ? definition.choiceList.map(subDef => new APIChoiceOption(subDef)) : null;
        this.hasChoices = !!(this.choiceList && this.choiceList.length);
        this.itemsType = definition.itemsType ? new APITypeSchema(definition.itemsType) : null;
        if (this.valueType === APIValueType.Array && !this.itemsType) {
            this.itemsType = new APITypeSchema({ valueType: APIValueType.Any});
        }
        this.properties = {};
        if (definition.properties) {
            for(let name in definition.properties) {
                this.properties[name] = new APIPropertyDescriptor(name, definition.properties[name]);
            }
        }
    }
}

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
    public valueType: APITypeSchema;
    public defaultValue: any;
    constructor(name: string, definition: IAPIPropertyDescriptor) {
        super(definition);
        this.name = name || definition.name || '';
        this.isMapName = definition.isMapName || false;
        this.valueType = new APITypeSchema(definition.valueType);
        this.defaultValue = definition.defaultValue === undefined ? null : definition.defaultValue;
    }
}







export class APIParameter extends APIValidableElement implements IAPIParameter {
    public name?: string;
    public sourceType: APIValueSourceType;
    public valueType: APITypeSchema;
    constructor(definition: IAPIParameter) {
        super(definition);
        this.name = definition.name;
        this.sourceType = definition.sourceType || APIValueSourceType.Route;
        this.valueType = definition.valueType ? new APITypeSchema(definition.valueType): new APITypeSchema({ valueType: APIValueType.Any });
    }

}


export class APIGroup implements IAPIGroup {
    public name : string;
    public routePrefix? :string;
    public controller?: string;
    public action?: string;
    public groups?: APIGroup[];
    public routes?: APIRoute[];
    constructor(parent:IAPINode, definition:IAPIGroup) {
        this.name = definition.name;
        this.routePrefix = definition.routePrefix;
        this.controller = definition.controller || parent.controller || '';
        this.action = definition.action || parent.action || '';
        this.groups = definition.groups ? definition.groups.map(subDef => new APIGroup(this, subDef)) : null;
        this.routes = definition.routes ? definition.routes.map(subDef => new APIRoute(this, subDef)) : null;
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
    constructor(parent:IAPINode, definition:IAPIRoute) {
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
            for(let statusCode in definition.errorTypes) {
                this.errorTypes[statusCode] = new APITypeSchema(definition.errorTypes[statusCode]);
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



export class APIStructure implements IAPIStructure{
    public name: string;
    public pathRoot: string;
    public version: string;
    public groups: APIGroup[];
    public routes: APIRoute[];
    public defaultResponseType: APITypeSchema;
    public errorTypes: {[status: number]: APITypeSchema};
    public modules:{[name:string]: APIModuleEntry };
    constructor(definition:IAPIStructure) {
        this.name = definition.name || 'API';
        this.pathRoot = definition.pathRoot || '/';
        this.version = definition.version;
        this.groups = definition.groups ? definition.groups.map((groupDefinition:IAPIGroup) => new APIGroup(this, groupDefinition)) : [];
        this.routes = definition.routes ? definition.routes.map((routeDefinition: IAPIRoute) => new APIRoute(this, routeDefinition)) : [];
        this.modules = {};
        if (definition.modules) {
            for(let name in definition.modules) {
                let entry = definition.modules[name];
                this.modules[name] = new APIModuleEntry(this, name, entry);
            }
        }
        this.defaultResponseType = definition.defaultResponseType ? new APITypeSchema(definition.defaultResponseType): null;
        this.errorTypes = {};
        if (definition.errorTypes) {
            for(let statusCode in definition.errorTypes) {
                this.errorTypes[statusCode] = new APITypeSchema(definition.errorTypes[statusCode]);
            }
        }
    }
}

export function defineAPIStructure(definition: IAPIStructure):APIStructure {
    return new APIStructure(definition);
}