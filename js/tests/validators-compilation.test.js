"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const api_interfaces_1 = require("../src/api-interfaces");
const chai_1 = require("chai");
describe('Test validator compilation', () => {
    it('Compile string validators', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.String,
        }, {
            required: true,
            minLength: 3
        });
        let result = validator('1234 ', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal('1234');
        let negativeResultRequiredCheck = validator(null, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrors.Required);
    });
    it('Compile boolean validators', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.Boolean,
        }, {
            required: true,
            minLength: 3
        });
        let result = validator(true, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(true);
        result = validator("Yes", api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(true);
        let negativeResultRequiredCheck = validator(null, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrors.TypeMismatch);
    });
    it('Compile integer validators', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.Integer,
        }, {
            required: true
        });
        let result = validator(12345, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(12345);
        result = validator("123256", api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.errorCode).equal(src_1.ValidationErrors.ValueCleanedUp);
        chai_1.expect(result.value).equal(123256);
        let negativeResultRequiredCheck = validator(null, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrors.InvalidFormat);
        let negativeResultInvalidTypeCheck = validator('123.256', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidTypeCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidTypeCheck.errorCode).equal(src_1.ValidationErrors.TypeMismatch);
    });
    it('Compile float validators', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.Float,
        }, {
            required: true
        });
        let result = validator(12345, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.value).equal(12345);
        result = validator("123.256", api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(result.isSuccess).equal(true);
        chai_1.expect(result.errorCode).equal(src_1.ValidationErrors.ValueCleanedUp);
        chai_1.expect(result.value).equal(123.256);
        let negativeResultRequiredCheck = validator(null, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultRequiredCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultRequiredCheck.errorCode).equal(src_1.ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(negativeResultInvalidCheck.isSuccess).equal(false);
        chai_1.expect(negativeResultInvalidCheck.errorCode).equal(src_1.ValidationErrors.InvalidFormat);
    });
    it('Compile object validator', () => {
        let validator = src_1.defineValidator({
            valueType: api_interfaces_1.APIValueType.Object,
            properties: {
                userName: {
                    valueType: {
                        valueType: api_interfaces_1.APIValueType.String,
                    },
                    minLength: 3,
                    required: true,
                },
                password: {
                    valueType: {
                        valueType: api_interfaces_1.APIValueType.String,
                    },
                    minLength: 8,
                    required: true,
                },
                rememberMe: {
                    valueType: {
                        valueType: api_interfaces_1.APIValueType.Boolean
                    },
                    defaultValue: false
                }
            }
        }, null);
        let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, api_interfaces_1.APIValueSourceType.Body);
        chai_1.expect(positiveResult.isSuccess).equal(true);
    });
});
//# sourceMappingURL=validators-compilation.test.js.map