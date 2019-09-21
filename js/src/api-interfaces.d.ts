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
    valueType: IAPITypeSchema;
    defaultValue?: any;
}
export interface IAPITypeSchema {
    valueType: APIValueType;
    choiceList?: IAPIChoiceOption[] | null;
    itemsType?: IAPITypeSchema | null;
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
    valueType: IAPITypeSchema;
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
    errorTypes?: {
        [status: number]: IAPITypeSchema;
    };
}
export interface IAPIGroup extends IAPINode {
    groups?: IAPIGroup[];
    routes?: IAPIRoute[];
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
    modules: {
        [name: string]: IAPIModuleEntryDefinition;
    };
    defaultResponseType: IAPITypeSchema;
    errorTypes: {
        [status: number]: IAPITypeSchema;
    };
}
//# sourceMappingURL=api-interfaces.d.ts.map