import { IAPIChoiceOption, IAPITypeSchema, IAPIValidationRules, IAPIParameter, APIValueSourceType, IAPIPropertyDescriptor, APIValueType, IAPIRoute, IAPIModuleEntryDefinition, APIModuleCreationMethod, IAPINode, HttpVerb, IAPIGroup, IAPIStructure } from './api-interfaces';
export declare class APIChoiceOption implements IAPIChoiceOption {
    label: string;
    value: (string | number | boolean | Date | null);
    constructor(definition: IAPIChoiceOption);
}
export declare class APITypeSchema implements IAPITypeSchema {
    valueType: APIValueType;
    choiceList?: APIChoiceOption[];
    hasChoices: boolean;
    itemsType: APITypeSchema;
    properties: {
        [name: string]: APIPropertyDescriptor;
    };
    preventExtraProperties: boolean;
    constructor(definition: IAPITypeSchema);
}
export declare class APIValidableElement implements IAPIValidationRules {
    required: boolean;
    minLength?: number;
    min?: number | Date;
    max?: number | Date;
    constructor(definition: IAPIValidationRules);
}
export declare class APIPropertyDescriptor extends APIValidableElement implements IAPIPropertyDescriptor {
    name: string;
    isMapName: boolean;
    valueType: APITypeSchema;
    defaultValue: any;
    constructor(name: string, definition: IAPIPropertyDescriptor);
}
export declare class APIParameter extends APIValidableElement implements IAPIParameter {
    name?: string;
    sourceType: APIValueSourceType;
    valueType: APITypeSchema;
    constructor(definition: IAPIParameter);
}
export declare class APIGroup implements IAPIGroup {
    name: string;
    routePrefix?: string;
    controller?: string;
    action?: string;
    groups?: APIGroup[];
    routes?: APIRoute[];
    constructor(parent: IAPINode, definition: IAPIGroup);
}
export declare class APIRoute implements IAPIRoute {
    name: string;
    controller: string;
    action: string;
    routePrefix: string;
    routeTemplate: string;
    verb: HttpVerb;
    parameters: APIParameter[];
    parent?: IAPINode;
    responseType: APITypeSchema;
    errorTypes: {
        [name: string]: APITypeSchema;
    };
    hasParameters: boolean;
    constructor(parent: IAPINode, definition: IAPIRoute);
}
export declare class APIModuleEntry implements IAPIModuleEntryDefinition {
    private api;
    name: string;
    path: string;
    creationMethod: APIModuleCreationMethod;
    singleton: boolean;
    constructor(api: APIStructure, name: string, definition: IAPIModuleEntryDefinition);
}
export declare class APIStructure implements IAPIStructure {
    name: string;
    pathRoot: string;
    version: string;
    groups: APIGroup[];
    routes: APIRoute[];
    defaultResponseType: APITypeSchema;
    errorTypes: {
        [status: number]: APITypeSchema;
    };
    modules: {
        [name: string]: APIModuleEntry;
    };
    constructor(definition: IAPIStructure);
}
export declare function defineAPIStructure(definition: IAPIStructure): APIStructure;
//# sourceMappingURL=api-structure.d.ts.map