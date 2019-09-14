
enum APIValueType {
    Null,
    String,
    Boolean,
    Integer,
    Float,
    Date,
    Choice,
    Array,
    Object
}

interface IAPIChoiceOption {
    value : (string|number|boolean|Date|null),
    label: string
}

interface IAPIPropertyDescriptor {
    name: string;
    isMapName: boolean;
    valueType: IAPITypeSchema;
    defaultValue? : any
    required?: boolean
}

interface IAPITypeSchema {
    valueType : APIValueType;
    choiceList?: IAPIChoiceOption[]|null;
    itemsType?: IAPITypeSchema|null;
    properties:{[name:string]:IAPIPropertyDescriptor };
}

enum APIValueSourceType {
    Route,
    Path,
    QueryString,
    Headers,
    Body

}

interface IAPIValueSource {
    sourceType:APIValueSourceType,
    name?:string
}


interface IAPIParameter {
    name: string;
    type: IAPITypeSchema;
    source: IAPIValueSource

}

enum HttpVerb {
    GET,
    POST,
    PUT,
    DELETE,
    OPTIONS,
    ALL
}

interface IAPINode {
    name: string;
    routePrefix?: string;
    controller?: string;
    action?: string;
    parent?: IAPINode
}

interface IAPIRoute extends IAPINode {
    verb: HttpVerb;
    routeTemplate: string;
    parameters?: IAPIParameter[];
    responseType?: IAPITypeSchema;
    errorTypes?: {[status: number]: IAPITypeSchema}
}

interface IAPIGroup extends IAPINode {
    groups?: IAPIGroup[]
    routes?: IAPIRoute[]

}


interface IAPIStructure extends IAPIGroup{
    pathRoot: string;
    version: string;
    modules: {[name:string]: IAPIModuleEntryDefinition };
}

class APIGroup implements IAPIGroup {
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

class APIRoute {
    public name: string;
    public controller: string;
    public action: string;
    public routePrefix: string;
    public routeTemplate: string;
    public verb: HttpVerb;
    public parent?: IAPINode;
    constructor(parent:IAPINode, definition:IAPIRoute) {
        this.parent = parent;
        this.name = definition.name;
        this.routeTemplate = definition.routeTemplate || '';
        this.routePrefix = definition.routePrefix || parent.routePrefix || '';
        this.verb = definition.verb || HttpVerb.GET;
        this.controller = definition.controller || parent.controller;
        this.action = definition.action;
    }
}

enum APIModuleCreationMethod {
    ConstructorCall,
    FunctionCall,
    ModuleResult,
}

interface IAPIModuleEntryDefinition {
    path: string;
    creationMethod?: APIModuleCreationMethod;
    singleton?: boolean
}

class APIModuleEntry implements IAPIModuleEntryDefinition {
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


class APIStructure implements IAPIStructure{
    public name: string;
    public pathRoot: string;
    public version: string;
    public groups: APIGroup[];
    public routes: APIRoute[];
    public defaultResponseType: IAPITypeSchema;
    public errorTypes: {[status: number]: IAPITypeSchema};
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
    }
}

export function defineAPIStructure(definition: IAPIStructure):APIStructure {
    return new APIStructure(definition);
}