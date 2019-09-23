export declare enum APIValueType {
    Any = "any",
    Null = "null",
    String = "string",
    Boolean = "bool",
    Integer = "int",
    Float = "float",
    Date = "date",
    Choice = "choice",
    Array = "array",
    Object = "object"
}
export interface IAPIChoiceOption {
    value: (string | number | boolean | Date | null);
    label: string;
}
export interface IAPIValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number | Date;
    max?: number | Date;
}
export interface IAPIPropertyDescriptor extends IAPIValidationRules {
    name?: string;
    isMapName?: boolean;
    valueSchema?: IAPITypeSchema;
    valueSchemaAlias?: string;
    defaultValue?: any;
}
export interface IAPITypeSchema {
    typeAlias?: string;
    valueType: APIValueType;
    choiceList?: IAPIChoiceOption[] | null;
    itemsType?: IAPITypeSchema | null;
    itemsTypeAlias?: string;
    properties?: {
        [name: string]: IAPIPropertyDescriptor;
    };
    preventExtraProperties?: boolean;
}
export declare enum APIValueSourceType {
    Route = "route",
    Path = "path",
    QueryString = "query",
    Headers = "headers",
    Body = "body"
}
export interface IAPIParameter extends IAPIValidationRules {
    name?: string;
    sourceType: APIValueSourceType;
    valueSchema: IAPITypeSchema;
    valueSchemaAlias?: string;
}
export declare enum HttpVerb {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",
    ALL = "ALL"
}
export interface IAPINode {
    name: string;
    routePrefix?: string;
    controller?: string;
    action?: string;
    parent?: IAPINode;
}
export interface IAPIRoute extends IAPINode {
    verb: HttpVerb;
    routeTemplate: string;
    parameters?: IAPIParameter[];
    responseType?: IAPITypeSchema;
    responseTypeAlias?: string;
    errorTypes?: {
        [status: number]: IAPITypeSchema | string;
    };
}
export interface IAPIGroup extends IAPINode {
    groups?: IAPIGroup[];
    routes?: IAPIRoute[];
}
export interface IAPIVersion extends IAPIGroup {
    version: string;
}
export declare enum APIModuleCreationMethod {
    ConstructorCall = "constructor",
    FunctionCall = "function",
    ModuleResult = "module"
}
export interface IAPIModuleEntryDefinition {
    path: string;
    creationMethod?: APIModuleCreationMethod;
    singleton?: boolean;
}
export interface IAPIStructure extends IAPIGroup {
    pathRoot: string;
    version: string;
    versions?: {
        [name: string]: IAPIVersion;
    };
    modules: {
        [name: string]: IAPIModuleEntryDefinition;
    };
    types: {
        [name: string]: IAPITypeSchema;
    };
    defaultResponseType: IAPITypeSchema;
    errorTypes: {
        [status: number]: IAPITypeSchema;
    };
}
//# sourceMappingURL=definition-interfaces.d.ts.map