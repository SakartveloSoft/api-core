"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("./api-interfaces");
class ValidationResult {
    constructor(errorCode, value, valueSource, validationPath) {
        this.validationPath = null;
        this.errorCode = null;
        this.isSuccess = false;
        this.valueSource = null;
        this.value = undefined;
        this.errorCode = errorCode;
        this.isSuccess = errorCode === 'success' || errorCode === 'valueCleanedUp';
        this.value = value;
        this.valueSource = valueSource;
        this.validationPath = validationPath;
    }
}
exports.ValidationResult = ValidationResult;
let validatorsCache = {};
let validators = {
    isString: (value) => typeof value === "string" || value instanceof String,
    isBoolean: (value) => value === true || value === false
};
let resultFactories = {
    success: new ValidationResult('success'),
    cleanValue: (value, valueSource, validationPath) => new ValidationResult('valueCleanedUp', value, valueSource, validationPath),
    valueRequired: (valueSource, validationPath) => {
        return new ValidationResult('required', undefined, valueSource, validationPath);
    },
    tooShort: (valueSource, validationPath) => {
        return new ValidationResult('tooShort', undefined, valueSource, validationPath);
    },
    tooLong: (valueSource, validationPath) => {
        return new ValidationResult('tooLong', undefined, valueSource, validationPath);
    },
    typeMismatch(expectedType, valueSource, validationPath) {
        return new ValidationResult('invalidType', undefined, valueSource, validationPath);
    }
};
const trueString = ['1', 'true', 'ok', 'yes', 'y'];
const falseString = ['0', 'false', 'cancel', 'no', 'n'];
let compiledCheckers = {
    skipValidation: () => {
        return resultFactories.success;
    },
    required: (value, valueSource, valueName, validationPath) => {
        if (value === null || value === undefined || value === '') {
            return resultFactories.valueRequired(valueSource, validationPath + '/' + valueName);
        }
    },
    ensureString: (value, valueSource, valueName, validationPath) => {
        if (value === null || value === undefined || value === '') {
            return resultFactories.success;
        }
        if (validators.isString(value)) {
            return resultFactories.success;
        }
        else {
            return resultFactories.typeMismatch(value, valueSource, validationPath + "/" + valueName);
        }
    },
    ensureStringNotBlank: (value, valueSource, valueName, validationPath) => {
        let cleanValue = value.toString().trim();
        if (cleanValue === value) {
            return resultFactories.success;
        }
        if (cleanValue.length === 0) {
            return resultFactories.valueRequired(valueSource, validationPath + '/' + valueName);
        }
        return resultFactories.cleanValue(cleanValue, valueSource, validationPath + '/' + valueName);
    },
    ensureStringMinLength: ((minLength) => {
        return (value, valueSource, valueName, validationPath) => {
            let valueLength = value.toString().length;
            if (valueLength < minLength) {
                return resultFactories.tooShort(valueSource, validationPath + '/' + valueName);
            }
        };
    },
        ensureBoolean)
}(value, any, valueSource ?  : api_interfaces_1.APIValueSourceType, valueName ?  : string, validationPath ?  : string), ValidationResult;
{
    if (validators.isBoolean(value)) {
        return resultFactories.success;
    }
    if (value === undefined || value === null) {
        return resultFactories.cleanValue(false, valueSource, validationPath + '/' + valueName);
    }
    let strLiteral = value.toString();
    if (trueString.includes(strLiteral)) {
        return resultFactories.cleanValue(true, valueSource, validationPath + '/' + valueName);
    }
    if (falseString.includes(strLiteral)) {
        return resultFactories.cleanValue(true, valueSource, validationPath + '/' + valueName);
    }
}
;
/*
function getSourceBody(func: Function):string {
    let fullSource = func.toString();
    return fullSource.substring(10, -1);
}
 */
function makeValidatorFunction(checksList) {
    return (value, valueSource, valueName, validationPath, parentNde) => {
        for (let x = 0; x < checksList.length; x++) {
            let checkResult = checksList[x](value, valueSource, valueName, validationPath);
            if (checkResult === resultFactories.success || checkResult === undefined || checkResult === null) {
                continue;
            }
            if (checkResult.errorCode === "success" || checkResult.errorCode === "valueCleanedUp") {
                continue;
            }
            return checkResult;
        }
        return resultFactories.success;
    };
}
function compileValidator(typeSchema, validationRules) {
    let validatorKey = JSON.stringify(typeSchema) + '\r\n' + JSON.stringify(validationRules);
    let validatorFunc = validatorsCache[validatorKey];
    if (!validatorFunc) {
        let functionCode = [];
        if (validationRules && validationRules.required) {
            functionCode.push(compiledCheckers.required);
        }
        switch (typeSchema.valueType) {
            case api_interfaces_1.APIValueType.String:
                functionCode.push(compiledCheckers.ensureString);
                if (validationRules.required) {
                    functionCode.push(compiledCheckers.ensureStringNotBlank);
                }
                if ((validationRules.minLength || 0) > 0) {
                    functionCode.push(compiledCheckers.minLength);
                }
                break;
            case api_interfaces_1.APIValueType.Boolean:
                functionCode.push(compiledCheckers.ensureBoolean);
                break;
            default:
                throw new Error(`Support for validation of ${typeSchema.valueType} values is not ready`);
        }
        if (functionCode.length === 0) {
            validatorFunc = compiledCheckers.skipValidation;
        }
        else {
            validatorFunc = makeValidatorFunction(functionCode);
        }
        validatorsCache[validatorKey] = validatorFunc;
    }
    return validatorFunc;
}
exports.compileValidator = compileValidator;
//# sourceMappingURL=request-validator.js.map