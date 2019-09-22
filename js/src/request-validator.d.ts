import { APIValueSourceType, IAPITypeSchema, IAPIValidationRules } from "./api-interfaces";
import { APITypesResolver } from './api-structure';
export declare class ValidationResult {
    validationPath: string;
    errorCode: string;
    isSuccess: boolean;
    valueSource?: APIValueSourceType;
    value?: any;
    options: Object;
    constructor(errorCode: (ValidationErrorCodes | string), value?: any, valueSource?: APIValueSourceType, validationPath?: string, options?: Object);
}
export declare enum ValidationErrorCodes {
    Success = "success",
    ValueCleanedUp = "valueCleanedUp",
    Required = "required",
    TooShort = "tooShort",
    TooLong = "tooLong",
    TypeMismatch = "typeMismatch",
    InvalidFormat = "invalidFormat",
    OutOfRange = "outOfRange",
    UnknownProperties = "unknownProperties",
    InvalidObject = "invalidObject"
}
declare type CompiledValidatorFunction = (value: any, valueSource: APIValueSourceType, valueName?: string) => ValidationResult;
export declare function compileValidator(typeSchema: IAPITypeSchema, validationRules: IAPIValidationRules, typesResolver?: APITypesResolver): CompiledValidatorFunction;
export {};
//# sourceMappingURL=request-validator.d.ts.map