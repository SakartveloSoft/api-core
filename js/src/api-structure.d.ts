import { APIModuleCreationMethod, APIValueSourceType, APIValueType, HttpVerb, IAPIChoiceOption, IAPIGroup, IAPIModuleEntryDefinition, IAPINode, IAPIParameter, IAPIPropertyDescriptor, IAPIRoute, IAPIStructure, IAPITypeSchema, IAPITypesResolver, IAPIValidationRules } from './api-interfaces';
export declare class APITypesResolver implements IAPITypesResolver {
    private _typesMap;
    constructor();
    resolveType(typeAlias: string): APITypeSchema;
    addTypeByDefinition(alias: string, definition: IAPITypeSchema): APITypeSchema;
    addOrResolveTypeSchemaForCollection(typeAlias?: string, typeSchema?: IAPITypeSchema): APITypeSchema;
}
export declare class APIChoiceOption implements IAPIChoiceOption {
    label: string;
    value: (string | number | boolean | Date | null);
    constructor(definition: IAPIChoiceOption);
}
export declare class APITypeSchema implements IAPITypeSchema {
    typeAlias: string;
    valueType: APIValueType;
    choiceList?: APIChoiceOption[];
    hasChoices: boolean;
    itemsType: APITypeSchema;
    itemsTypeAlias?: string;
    properties: {
        [name: string]: APIPropertyDescriptor;
    };
    preventExtraProperties: boolean;
    constructor(definition: IAPITypeSchema, typesResolver: APITypesResolver);
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
    valueSchema: APITypeSchema;
    valueSchemaAlias: string;
    defaultValue: any;
    constructor(name: string, definition: IAPIPropertyDescriptor, typesResolver: APITypesResolver);
}
export declare class APIParameter extends APIValidableElement implements IAPIParameter {
    name?: string;
    sourceType: APIValueSourceType;
    valueSchema: APITypeSchema;
    constructor(definition: IAPIParameter, typesResolver: APITypesResolver);
}
export declare class APIGroup implements IAPIGroup {
    name: string;
    routePrefix?: string;
    controller?: string;
    action?: string;
    groups?: APIGroup[];
    routes?: APIRoute[];
    constructor(parent: IAPINode, definition: IAPIGroup, typesResolver: APITypesResolver);
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
    constructor(parent: IAPINode, definition: IAPIRoute, typesResolver: APITypesResolver);
}
export declare class APIModuleEntry implements IAPIModuleEntryDefinition {
    private api;
    name: string;
    path: string;
    creationMethod: APIModuleCreationMethod;
    singleton: boolean;
    constructor(api: APIStructure, name: string, definition: IAPIModuleEntryDefinition);
}
export declare class APIStructure {
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
    private _types;
    constructor(definition: IAPIStructure);
}
export declare function defineAPIStructure(definition: IAPIStructure | any): APIStructure;
//# sourceMappingURL=api-structure.d.ts.map