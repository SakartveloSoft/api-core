import { APIStructure } from "./api-structure";
import { setCodeRoot } from "./modules-resolver";
import { compileValidator, ValidationErrorCodes } from './request-validator';
import { IAPIStructure } from "./api-interfaces";
export declare const definePIStructure: (structureDefinition: IAPIStructure) => APIStructure;
export declare const loadAPIStructureFromJSON: (objectJSON: any) => APIStructure;
export declare const bindsCodeRoot: typeof setCodeRoot;
export declare const defineValidator: typeof compileValidator;
export declare const ValidationErrors: typeof ValidationErrorCodes;
//# sourceMappingURL=index.d.ts.map