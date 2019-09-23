"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const definition_interfaces_1 = require("../src/definition-interfaces");
const chai_1 = require("chai");
describe('Test validator compilation', () => {
    it('Compile string validators', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.String,
        }, {
            required: true,
            minLength: 3
        });
        let result = validator('1234 ', definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal('1234');
        let negativeResultRequiredCheck = validator(null, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrorCodes.Required);
    });
    it('Compile boolean validators', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.Boolean,
        }, {
            required: true,
            minLength: 3
        });
        let result = validator(true, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(true);
        result = validator("Yes", definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(true);
        let negativeResultRequiredCheck = validator(null, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrorCodes.TypeMismatch);
    });
    it('Compile integer validators', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.Integer,
        }, {
            required: true
        });
        let result = validator(12345, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(12345);
        result = validator("123256", definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.errorCode).equal(src_1.ValidationErrorCodes.ValueCleanedUp);
        chai_1.expect(result.value).equal(123256);
        let negativeResultRequiredCheck = validator(null, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrorCodes.InvalidFormat);
        let negativeResultInvalidTypeCheck = validator('123.256', definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidTypeCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidTypeCheck.errorCode).equal(src_1.ValidationErrorCodes.TypeMismatch);
    });
    it('Compile float validators', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.Float,
        }, {
            required: true
        });
        let result = validator(12345, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(12345);
        result = validator("123.256", definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.errorCode).equal(src_1.ValidationErrorCodes.ValueCleanedUp);
        chai_1.expect(result.value).equal(123.256);
        let negativeResultRequiredCheck = validator(null, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrorCodes.InvalidFormat);
    });
    it('Compile object validator', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.Object,
            properties: {
                userName: {
                    valueSchema: {
                        valueType: definition_interfaces_1.APIValueType.String,
                    },
                    minLength: 3,
                    required: true,
                },
                password: {
                    valueSchema: {
                        valueType: definition_interfaces_1.APIValueType.String,
                    },
                    minLength: 8,
                    required: true,
                },
                rememberMe: {
                    valueSchema: {
                        valueType: definition_interfaces_1.APIValueType.Boolean
                    },
                    defaultValue: false
                }
            }
        }, null);
        let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(positiveResult.isSuccess).equal(true);
    });
    it('Compile type validator by aliases', () => {
        let validator = src_1.compileValidator({
            valueType: definition_interfaces_1.APIValueType.Object,
            properties: {
                userName: {
                    valueSchemaAlias: definition_interfaces_1.APIValueType.String,
                    minLength: 3,
                    required: true,
                },
                password: {
                    valueSchemaAlias: definition_interfaces_1.APIValueType.String,
                    minLength: 8,
                    required: true,
                },
                rememberMe: {
                    valueSchemaAlias: definition_interfaces_1.APIValueType.Boolean,
                    defaultValue: false
                }
            }
        }, null);
        let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, definition_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(positiveResult.isSuccess).equal(true);
        chai_1.expect(positiveResult.value).an('object');
        chai_1.expect(positiveResult.value.rememberMe).equal(true);
    });
});
//# sourceMappingURL=validators-compilation.test.js.map