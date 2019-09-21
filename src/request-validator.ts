import {APIValueSourceType, APIValueType, IAPITypeSchema, IAPIValidationRules} from "./api-interfaces";

export class ValidationResult {
    public validationPath:string = null;
    public errorCode: string = null;
    public isSuccess: boolean = false;
    public valueSource?: APIValueSourceType = null;
    public value?: any = undefined;
    public options: Object = null;
    constructor(errorCode: (ValidationErrorCodes|string), value?: any, valueSource?: APIValueSourceType, validationPath?: string, options?:Object) {
        this.errorCode = errorCode;
        this.isSuccess = errorCode === 'success' || errorCode === 'valueCleanedUp';
        this.value = value;
        this.valueSource = valueSource;
        this.validationPath = validationPath;
        this.options = options || null;
    }
}
let validatorsCache : {[defintion: string]:((value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string) => ValidationResult)} = {};

let validators = {
    isString: (value: any):value is string => typeof value === "string" || value instanceof String,
    isBoolean: (value: any): value is boolean => value === true || value === false,
    isNumber: (value: any): value is number => value !== undefined && value !== null && (typeof (value) === "number" || value instanceof Number) && !isNaN(value instanceof Number ? value.valueOf() : value),
    isDate: (value: any): value is Date => value !== null && value !== undefined && value instanceof Date
};

export enum ValidationErrorCodes  {
    Success = "success",
    ValueCleanedUp = "valueCleanedUp",
    Required = "required",
    TooShort = "tooShort",
    TooLong = "tooLong",
    TypeMismatch = "typeMismatch",
    InvalidFormat = "invalidFormat",
    OutOfRange = "outOfRange",
    UnknownProperties = 'unknownProperties',
    InvalidObject = 'invalidObject'
}

let resultFactories = {
    success : new ValidationResult(ValidationErrorCodes.Success),
    successValue: (value: any) => new ValidationResult(ValidationErrorCodes.Success, value),
    cleanValue:(value: any,  valueSource: APIValueSourceType, validationPath?: string) => new ValidationResult(ValidationErrorCodes.ValueCleanedUp, value, valueSource, validationPath),
    valueRequired:(valueSource?: APIValueSourceType, validationPath?: string):ValidationResult => {
        return new ValidationResult(ValidationErrorCodes.Required, undefined, valueSource, validationPath);
    },
    tooShort: (minLength: number,valueSource?: APIValueSourceType, validationPath?: string):ValidationResult => {
        return new ValidationResult(ValidationErrorCodes.TooShort, undefined, valueSource, validationPath, { minLength: minLength});
    },
    tooLong: (maxLength: number,valueSource?: APIValueSourceType, validationPath?: string):ValidationResult => {
        return new ValidationResult(ValidationErrorCodes.TooLong, undefined, valueSource, validationPath, { maxLength: maxLength });
    },
    typeMismatch(expectedType: APIValueType, valueSource?: APIValueSourceType, validationPath?: string):ValidationResult {
        return new ValidationResult(ValidationErrorCodes.TypeMismatch,  undefined, valueSource, validationPath);
    },
    invalidFormat(invalidValue:any, expectedType: APIValueType, valueSource?: APIValueSourceType, validationPath?: string):ValidationResult {
        return new ValidationResult(ValidationErrorCodes.InvalidFormat, invalidValue, valueSource, validationPath, { expectedType: expectedType});
    },
    outOfRange(invalidValue: any, expectedType: APIValueType, valueSource?: APIValueSourceType, validationPath?: string, minValue?: any, maxValue?: any):ValidationResult {
        return new ValidationResult(ValidationErrorCodes.OutOfRange, invalidValue, valueSource, validationPath, { min: minValue, max: maxValue });
    },
    unknownProperties(valueSource?: APIValueSourceType, validationPath?: string, unknownProperties?: string[]):ValidationResult {
        return new ValidationResult(ValidationErrorCodes.UnknownProperties, undefined, valueSource, validationPath, { unknownProperties: unknownProperties });
    },
    invalidObject(valueSource?: APIValueSourceType, validationPath?: string, validationErrors?: {[name: string] :ValidationResult }) {
        return new ValidationResult(ValidationErrorCodes.InvalidObject, undefined, valueSource, validationPath, { errors: validationErrors });
    }
};

type ValidationCheckFunction = (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string, parentNode?: any) => ValidationResult;

type CompiledValidatorFunction = (value: any, valueSource: APIValueSourceType, valueName?:string) => ValidationResult;

const trueString = ['1', 'true', 'ok', 'yes','y'];
const falseString = ['0', 'false', 'cancel', 'no', 'n'];

let compiledCheckers = {
    skipValidation: ():ValidationResult => {
        return resultFactories.success;
    },
    required:(value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string):ValidationResult => {
        if (value === null || value === undefined || value === '') {
            return  resultFactories.valueRequired(valueSource, validationPath + '/' + valueName);
        }
    },
    ensureString: (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string):ValidationResult => {
        if (value === null || value === undefined || value === '') {
            return resultFactories.success;
        }
        if (validators.isString(value)) {
            return resultFactories.success;
        } else {
            return resultFactories.typeMismatch(value, valueSource, validationPath + "/" + valueName);
        }
    },
    ensureStringNotBlank: (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string, parentNode?:any): ValidationResult => {
        let cleanValue = value.toString().trim();
        if (cleanValue === value) {
            return resultFactories.success;
        }
        if (cleanValue.length === 0) {
            return resultFactories.valueRequired(valueSource, validationPath + '/' + valueName);
        }
        if (parentNode && valueName) {
            parentNode[valueName] = cleanValue;
        }
        return resultFactories.cleanValue(cleanValue, valueSource, validationPath + '/' + valueName);
    },
    ensureStringMinLength:(minLength:number) => {
        return (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string) => {
            let valueLength = value.toString().length;
            if (valueLength < minLength) {
                return resultFactories.tooShort(minLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureStringMaxLength:(maxLength:number) => {
        return (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string) => {
            let valueLength = value.toString().length;
            if (valueLength > maxLength) {
                return resultFactories.tooLong(maxLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureStringLengthRange:(minLength: number, maxLength:number) => {
        return (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string) => {
            let valueLength = value.toString().length;
            if (valueLength > maxLength) {
                return resultFactories.tooLong(maxLength, valueSource, validationPath + '/' + valueName);
            }
            if (valueLength < minLength) {
                return resultFactories.tooShort(minLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureBoolean: (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string, parentNode?: any): ValidationResult => {
        if (validators.isBoolean(value)) {
            return resultFactories.successValue(value);
        }
        if (value === undefined || value === null) {
            if (parentNode && valueName) {
                parentNode[valueName] = false;
            }
            return resultFactories.cleanValue(false, valueSource, validationPath + '/' + valueName);
        }
        let strLiteral = value.toString().trim().toLowerCase();
        let cleanValue = false;
        if (trueString.includes(strLiteral)) {
            cleanValue = true;
        } else if (falseString.includes(strLiteral)) {
            cleanValue = false;
        } else {
            return resultFactories.typeMismatch(APIValueType.Boolean, valueSource, `${validationPath}/${valueName}`);
        }
        return resultFactories.cleanValue(cleanValue, valueSource, `${validationPath}/${valueName}`);
    },
    ensureValidDate(value: any, valueSource?: APIValueSourceType, valueName?:string, validationPath?: string, parentNode?: any):ValidationResult {
        let cleanValue: Date;
        if (validators.isDate(value)) {
            cleanValue = value;
        } else if (validators.isString(value) || validators.isNumber(value)) {
            value = value.toString().trim();
            try {
                cleanValue = new Date(value.toString().trim().toLowerCase());
            } catch (e) {
                return resultFactories.typeMismatch(APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
            }
            if (cleanValue.toString() === "Invalid Date") {
                return resultFactories.invalidFormat(value, APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
            }
        } else {
            return resultFactories.typeMismatch(APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
        }
        if (value === cleanValue) {
            return resultFactories.successValue(cleanValue);
        } else {
            if (parentNode && valueName) {
                parentNode[valueName] = cleanValue;
            }
            return resultFactories.cleanValue(value, valueSource, `${validationPath}/${valueName}`);
        }
    },
    ensureValidNumber(expectedSubType: APIValueType, minValue?:number, maxValue?: number) {
        return (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string):ValidationResult => {
            let cleanValue: number;
            if (validators.isNumber(value)) {
                cleanValue = value;
            } else if (validators.isString(value)) {
                cleanValue = parseFloat(value);
                if (isNaN(cleanValue) || cleanValue.toString() !== value) {
                    return resultFactories.invalidFormat(value, expectedSubType, valueSource, `${validationPath}/${valueName}`);
                }
                if (expectedSubType === APIValueType.Integer && (Math.floor(cleanValue) !== cleanValue)) {
                    return resultFactories.typeMismatch(expectedSubType, valueSource, `${validationPath}/${valueName}`);
                }
            } else {
                return resultFactories.typeMismatch(expectedSubType, valueSource, `${validationPath}/${valueName}`);
            }
            if (validators.isNumber(minValue) && (cleanValue < minValue)) {
                return resultFactories.outOfRange(value, expectedSubType, valueSource, `${validationPath}/${valueName}`, minValue, maxValue);
            }
            if (validators.isNumber(maxValue) && (cleanValue > maxValue)) {
                return resultFactories.outOfRange(value, expectedSubType, valueSource, `${validationPath}/${valueName}`, minValue, maxValue);
            }
            return resultFactories.cleanValue(cleanValue, valueSource, `${validationPath}/${valueName}`);
        };
    },
    ensureValidObject(objectSchema: IAPITypeSchema) {
        let knownProperties = Object.keys(objectSchema.properties);
        let compiledValidators: { [name: string]: CompiledValidatorFunction } = {};
        for (let x = 0; x < knownProperties.length; x++) {
            let name = knownProperties[x];
            let prop = objectSchema.properties[name];
            compiledValidators[name] = compileValidator(prop.valueType, prop);
        }
        return (value: any, valueSource?: APIValueSourceType, valueName?: string, validationPath?: string): ValidationResult => {
            let validationErrors: { [name: string]: ValidationResult } = {};
            let hasErrors = false;
            let unknownProperties: string[] = [];
            for (let name in value) {
                if (value.hasOwnProperty(name)) {
                    if (compiledValidators.hasOwnProperty(name)) {
                        let propResult = compiledValidators[name](value[name], valueSource, `${validationPath}/${valueName}/${name}`);
                        if (propResult.errorCode === ValidationErrorCodes.ValueCleanedUp) {
                            value[name] = propResult.value;
                        } else if (!propResult.isSuccess) {
                            hasErrors = true;
                            validationErrors[name] = propResult;
                        }
                    } else {
                        unknownProperties.push(name);
                    }
                }
            }
            if (hasErrors) {
                return resultFactories.invalidObject(valueSource, `${validationPath}/${valueName}`, validationErrors);
            }
            if (unknownProperties.length > 0) {
                return resultFactories.unknownProperties(valueSource, `${validationPath}/${valueName}`, unknownProperties);
            }
        };
    }
};

/*
function getSourceBody(func: Function):string {
    let fullSource = func.toString();
    return fullSource.substring(10, -1);
}
 */


function makeValidatorFunction(checksList: ValidationCheckFunction[]): CompiledValidatorFunction {
    return (value:any, valueSource: APIValueSourceType, valueName?:string, validationPath?:string):ValidationResult => {
        valueName = valueName || '';
        validationPath = validationPath || '';
        let hadValueCleanup = false;
        for(let x = 0; x < checksList.length; x++) {
            let checkResult = checksList[x](value, valueSource, valueName, validationPath, null);
            if (checkResult === resultFactories.success || checkResult === undefined || checkResult === null || checkResult.errorCode === "success") {
                continue;
            }
            if (checkResult.errorCode === "valueCleanedUp") {
                value = checkResult.value;
                hadValueCleanup = true;
                continue;
            }
            return checkResult;
        }
        if (hadValueCleanup) {
            return resultFactories.cleanValue(value, valueSource, validationPath + '/' + valueName)
        }
        return resultFactories.successValue(value);
    }
}

export function compileValidator(typeSchema:IAPITypeSchema, validationRules: IAPIValidationRules):CompiledValidatorFunction {
    let validatorKey = JSON.stringify(typeSchema) + '\r\n' + JSON.stringify(validationRules);
    let validatorFunc = validatorsCache[validatorKey];
    if (!validatorFunc) {
        let functionCode: ValidationCheckFunction[] = [];
        if (validationRules && validationRules.required) {
            functionCode.push(compiledCheckers.required)
        }
        switch (typeSchema.valueType) {
            case APIValueType.String:
                functionCode.push(compiledCheckers.ensureString);
                if (validationRules.required) {
                    functionCode.push(compiledCheckers.ensureStringNotBlank);
                }
                let cleanLimits = {
                    minLength: (validationRules.minLength || 0),
                    maxLength: (validationRules.maxLength || 0)
                };
                if (cleanLimits.minLength > 0 && cleanLimits.maxLength === 0) {
                    functionCode.push(compiledCheckers.ensureStringMinLength(cleanLimits.minLength));
                } else if (cleanLimits.minLength === 0 && cleanLimits.maxLength > 0) {
                    functionCode.push(compiledCheckers.ensureStringMaxLength(cleanLimits.maxLength));
                } else if (cleanLimits.minLength > 0 && cleanLimits.maxLength > 0) {
                    functionCode.push(compiledCheckers.ensureStringLengthRange(cleanLimits.minLength, cleanLimits.maxLength));
                }
                break;
            case APIValueType.Boolean:
                functionCode.push(compiledCheckers.ensureBoolean);
                break;
            case APIValueType.Integer:
            case APIValueType.Float:
                let cleanMin: number;
                let cleanMax: number;
                if (validationRules) {
                    if (validators.isNumber(validationRules.min)) {
                        cleanMin = validationRules.min;
                    }
                    if (validators.isNumber(validationRules.max)) {
                        cleanMax = validationRules.max;
                    }
                }
                functionCode.push(compiledCheckers.ensureValidNumber(typeSchema.valueType, cleanMin, cleanMax));
                break;
            case APIValueType.Date:
                functionCode.push(compiledCheckers.ensureValidDate);
                break;
            case APIValueType.Object:
                functionCode.push(compiledCheckers.ensureValidObject(typeSchema));
                break;
            default:
                throw new Error(`Support for validation of ${typeSchema.valueType} values is not ready`);
        }
        if (functionCode.length === 0) {
            validatorFunc = compiledCheckers.skipValidation;
        } else {
            validatorFunc = makeValidatorFunction(functionCode);
        }
        validatorsCache[validatorKey] = validatorFunc;
    }
    return validatorFunc;
}