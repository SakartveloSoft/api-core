import {APIValueSourceType, APIValueType, IAPITypeSchema, IAPIValidationRules} from "./api-interfaces";

export class ValidationResult {
    public validationPath:string = null;
    public errorCode: string = null;
    public isSuccess: boolean = false;
    public valueSource?: APIValueSourceType = null;
    public value?: any = undefined;
    public options: Object = null;
    constructor(errorCode: string, value?: any, valueSource?: APIValueSourceType, validationPath?: string, options?:Object) {
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
    isString: (value: any) => typeof value === "string" || value instanceof String,
    isBoolean: (value: any) => value === true || value === false
};

let resultFactories = {
    success : new ValidationResult('success'),
    successValue: (value: any) => new ValidationResult('success', value),
    cleanValue:(value: any,  valueSource: APIValueSourceType, validationPath?: string) => new ValidationResult('valueCleanedUp', value, valueSource, validationPath),
    valueRequired:(valueSource?: APIValueSourceType, validationPath?: string) => {
        return new ValidationResult('required', undefined, valueSource, validationPath);
    },
    tooShort: (minLength: number,valueSource?: APIValueSourceType, validationPath?: string) => {
        return new ValidationResult('tooShort', undefined, valueSource, validationPath, { minLength: minLength});
    },
    tooLong: (maxLength: number,valueSource?: APIValueSourceType, validationPath?: string) => {
        return new ValidationResult('tooLong', undefined, valueSource, validationPath, { maxLength: maxLength });
    },
    typeMismatch(expectedType: APIValueType, valueSource?: APIValueSourceType, validationPath?: string) {
        return new ValidationResult('invalidType',  undefined, valueSource, validationPath);
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
            return resultFactories.success;
        }
        if (value === undefined || value === null) {
            if (parentNode && valueName) {
                parentNode[valueName] = false;
            }
            return resultFactories.cleanValue(false, valueSource, validationPath + '/' + valueName);
        }
        let strLiteral = value.toString();
        if (trueString.includes(strLiteral)) {
            if (parentNode && valueName) {
                parentNode[valueName] = true;
            }
            return resultFactories.cleanValue(true, valueSource, validationPath + '/' + valueName);
        }
        if (falseString.includes(strLiteral)) {
            if (parentNode && valueName) {
                parentNode[valueName] = false;
            }
            return resultFactories.cleanValue(true, valueSource, validationPath + '/' + valueName);
        }
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
        return resultFactories.success;
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