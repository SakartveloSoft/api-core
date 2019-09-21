"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("./api-interfaces");
class ValidationResult {
    constructor(errorCode, value, valueSource, validationPath, options) {
        this.validationPath = null;
        this.errorCode = null;
        this.isSuccess = false;
        this.valueSource = null;
        this.value = undefined;
        this.options = null;
        this.errorCode = errorCode;
        this.isSuccess = errorCode === 'success' || errorCode === 'valueCleanedUp';
        this.value = value;
        this.valueSource = valueSource;
        this.validationPath = validationPath;
        this.options = options || null;
    }
}
exports.ValidationResult = ValidationResult;
let validatorsCache = {};
let validators = {
    isString: (value) => typeof value === "string" || value instanceof String,
    isBoolean: (value) => value === true || value === false,
    isNumber: (value) => value !== undefined && value !== null && (typeof (value) === "number" || value instanceof Number) && !isNaN(value instanceof Number ? value.valueOf() : value),
    isDate: (value) => value !== null && value !== undefined && value instanceof Date
};
var ValidationErrorCodes;
(function (ValidationErrorCodes) {
    ValidationErrorCodes["Success"] = "success";
    ValidationErrorCodes["ValueCleanedUp"] = "valueCleanedUp";
    ValidationErrorCodes["Required"] = "required";
    ValidationErrorCodes["TooShort"] = "tooShort";
    ValidationErrorCodes["TooLong"] = "tooLong";
    ValidationErrorCodes["TypeMismatch"] = "typeMismatch";
    ValidationErrorCodes["InvalidFormat"] = "invalidFormat";
    ValidationErrorCodes["OutOfRange"] = "outOfRange";
    ValidationErrorCodes["UnknownProperties"] = "unknownProperties";
    ValidationErrorCodes["InvalidObject"] = "invalidObject";
})(ValidationErrorCodes = exports.ValidationErrorCodes || (exports.ValidationErrorCodes = {}));
let resultFactories = {
    success: new ValidationResult(ValidationErrorCodes.Success),
    successValue: (value) => new ValidationResult(ValidationErrorCodes.Success, value),
    cleanValue: (value, valueSource, validationPath) => new ValidationResult(ValidationErrorCodes.ValueCleanedUp, value, valueSource, validationPath),
    valueRequired: (valueSource, validationPath) => {
        return new ValidationResult(ValidationErrorCodes.Required, undefined, valueSource, validationPath);
    },
    tooShort: (minLength, valueSource, validationPath) => {
        return new ValidationResult(ValidationErrorCodes.TooShort, undefined, valueSource, validationPath, { minLength: minLength });
    },
    tooLong: (maxLength, valueSource, validationPath) => {
        return new ValidationResult(ValidationErrorCodes.TooLong, undefined, valueSource, validationPath, { maxLength: maxLength });
    },
    typeMismatch(expectedType, valueSource, validationPath) {
        return new ValidationResult(ValidationErrorCodes.TypeMismatch, undefined, valueSource, validationPath);
    },
    invalidFormat(invalidValue, expectedType, valueSource, validationPath) {
        return new ValidationResult(ValidationErrorCodes.InvalidFormat, invalidValue, valueSource, validationPath, { expectedType: expectedType });
    },
    outOfRange(invalidValue, expectedType, valueSource, validationPath, minValue, maxValue) {
        return new ValidationResult(ValidationErrorCodes.OutOfRange, invalidValue, valueSource, validationPath, { min: minValue, max: maxValue });
    },
    unknownProperties(valueSource, validationPath, unknownProperties) {
        return new ValidationResult(ValidationErrorCodes.UnknownProperties, undefined, valueSource, validationPath, { unknownProperties: unknownProperties });
    },
    invalidObject(valueSource, validationPath, validationErrors) {
        return new ValidationResult(ValidationErrorCodes.InvalidObject, undefined, valueSource, validationPath, { errors: validationErrors });
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
    ensureStringNotBlank: (value, valueSource, valueName, validationPath, parentNode) => {
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
    ensureStringMinLength: (minLength) => {
        return (value, valueSource, valueName, validationPath) => {
            let valueLength = value.toString().length;
            if (valueLength < minLength) {
                return resultFactories.tooShort(minLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureStringMaxLength: (maxLength) => {
        return (value, valueSource, valueName, validationPath) => {
            let valueLength = value.toString().length;
            if (valueLength > maxLength) {
                return resultFactories.tooLong(maxLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureStringLengthRange: (minLength, maxLength) => {
        return (value, valueSource, valueName, validationPath) => {
            let valueLength = value.toString().length;
            if (valueLength > maxLength) {
                return resultFactories.tooLong(maxLength, valueSource, validationPath + '/' + valueName);
            }
            if (valueLength < minLength) {
                return resultFactories.tooShort(minLength, valueSource, validationPath + '/' + valueName);
            }
        };
    },
    ensureBoolean: (value, valueSource, valueName, validationPath, parentNode) => {
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
        }
        else if (falseString.includes(strLiteral)) {
            cleanValue = false;
        }
        else {
            return resultFactories.typeMismatch(api_interfaces_1.APIValueType.Boolean, valueSource, `${validationPath}/${valueName}`);
        }
        return resultFactories.cleanValue(cleanValue, valueSource, `${validationPath}/${valueName}`);
    },
    ensureValidDate(value, valueSource, valueName, validationPath, parentNode) {
        let cleanValue;
        if (validators.isDate(value)) {
            cleanValue = value;
        }
        else if (validators.isString(value) || validators.isNumber(value)) {
            value = value.toString().trim();
            try {
                cleanValue = new Date(value.toString().trim().toLowerCase());
            }
            catch (e) {
                return resultFactories.typeMismatch(api_interfaces_1.APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
            }
            if (cleanValue.toString() === "Invalid Date") {
                return resultFactories.invalidFormat(value, api_interfaces_1.APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
            }
        }
        else {
            return resultFactories.typeMismatch(api_interfaces_1.APIValueType.Date, valueSource, `${validationPath}/${valueName}`);
        }
        if (value === cleanValue) {
            return resultFactories.successValue(cleanValue);
        }
        else {
            if (parentNode && valueName) {
                parentNode[valueName] = cleanValue;
            }
            return resultFactories.cleanValue(value, valueSource, `${validationPath}/${valueName}`);
        }
    },
    ensureValidNumber(expectedSubType, minValue, maxValue) {
        return (value, valueSource, valueName, validationPath) => {
            let cleanValue;
            if (validators.isNumber(value)) {
                cleanValue = value;
            }
            else if (validators.isString(value)) {
                cleanValue = parseFloat(value);
                if (isNaN(cleanValue) || cleanValue.toString() !== value) {
                    return resultFactories.invalidFormat(value, expectedSubType, valueSource, `${validationPath}/${valueName}`);
                }
                if (expectedSubType === api_interfaces_1.APIValueType.Integer && (Math.floor(cleanValue) !== cleanValue)) {
                    return resultFactories.typeMismatch(expectedSubType, valueSource, `${validationPath}/${valueName}`);
                }
            }
            else {
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
    ensureValidObject(objectSchema) {
        let knownProperties = Object.keys(objectSchema.properties);
        let compiledValidators = {};
        for (let x = 0; x < knownProperties.length; x++) {
            let name = knownProperties[x];
            let prop = objectSchema.properties[name];
            compiledValidators[name] = compileValidator(prop.valueType, prop);
        }
        return (value, valueSource, valueName, validationPath) => {
            let validationErrors = {};
            let hasErrors = false;
            let unknownProperties = [];
            for (let name in value) {
                if (value.hasOwnProperty(name)) {
                    if (compiledValidators.hasOwnProperty(name)) {
                        let propResult = compiledValidators[name](value[name], valueSource, `${validationPath}/${valueName}/${name}`);
                        if (propResult.errorCode === ValidationErrorCodes.ValueCleanedUp) {
                            value[name] = propResult.value;
                        }
                        else if (!propResult.isSuccess) {
                            hasErrors = true;
                            validationErrors[name] = propResult;
                        }
                    }
                    else {
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
function makeValidatorFunction(checksList) {
    return (value, valueSource, valueName, validationPath) => {
        valueName = valueName || '';
        validationPath = validationPath || '';
        let hadValueCleanup = false;
        for (let x = 0; x < checksList.length; x++) {
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
            return resultFactories.cleanValue(value, valueSource, validationPath + '/' + valueName);
        }
        return resultFactories.successValue(value);
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
                let cleanLimits = {
                    minLength: (validationRules.minLength || 0),
                    maxLength: (validationRules.maxLength || 0)
                };
                if (cleanLimits.minLength > 0 && cleanLimits.maxLength === 0) {
                    functionCode.push(compiledCheckers.ensureStringMinLength(cleanLimits.minLength));
                }
                else if (cleanLimits.minLength === 0 && cleanLimits.maxLength > 0) {
                    functionCode.push(compiledCheckers.ensureStringMaxLength(cleanLimits.maxLength));
                }
                else if (cleanLimits.minLength > 0 && cleanLimits.maxLength > 0) {
                    functionCode.push(compiledCheckers.ensureStringLengthRange(cleanLimits.minLength, cleanLimits.maxLength));
                }
                break;
            case api_interfaces_1.APIValueType.Boolean:
                functionCode.push(compiledCheckers.ensureBoolean);
                break;
            case api_interfaces_1.APIValueType.Integer:
            case api_interfaces_1.APIValueType.Float:
                let cleanMin;
                let cleanMax;
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
            case api_interfaces_1.APIValueType.Date:
                functionCode.push(compiledCheckers.ensureValidDate);
                break;
            case api_interfaces_1.APIValueType.Object:
                functionCode.push(compiledCheckers.ensureValidObject(typeSchema));
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