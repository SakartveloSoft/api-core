"use strict";
import {APIValueType} from "../src/api-interfaces";

Object.defineProperty(exports, "__esModule", { value: true });
const api_interfaces_1 = require("./api-interfaces");
class ValidationResult {
    public errorCode: string;
    constructor(errorCode, valueSource, validationPath) {
        this.validationPath = null;
        this.errorCode = null;
        this.valueSource = null;
        this.errorCode = errorCode;
        this.isSuccess = errorCode === 'success' || errorCode === '';
        this.valueSource = valueSource;
        this.validationPath = validationPath;
    }
}
exports.ValidationResult = ValidationResult;
let validatorsCache = {};
let validators = {
    isString: (value) => typeof value === "string" || value instanceof String,
};
let resultFactories = {
    success: new ValidationResult('success'),
    typeMismatch(expectedType, valueSource, validationPath) {
        return new ValidationResult('invalidType', valueSource, validationPath);
    }
};
let compiledCheckers = {
    isString: (value, valueSource, valueName, validationPath) => {
        if (!validators.isString(value)) {
            return resultFactories.typeMismatch(value, valueSource, validationPath + "/" + valueName);
        }
    },
    isBoolean: (value, valueSource, valueName, validationPath) => {

    }
};
function getSourceBody(func) {
    let fullSource = func.toString();
    return fullSource.substring(10, -1);
}
class CompiledValidator {
    constructor(typeSchema, validationRules) {
        let validatorKey = JSON.stringify(typeSchema) + '\r\n' + JSON.stringify(validationRules);
        let validatorFunc = validatorsCache[validatorKey];
        if (!validatorFunc) {
        }
        let functionCode = [];
        switch (typeSchema.valueType) {
            case api_interfaces_1.APIValueType.String:
                functionCode.push(getSourceBody(compiledCheckers.isString));
                break;
            case APIValueType.Boolean:

        }
    }
}
//# sourceMappingURL=request-validator.js.map