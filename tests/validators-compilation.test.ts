import {defineValidator, ValidationErrors} from '../src';
import {APIValueSourceType, APIValueType} from "../src/api-interfaces";
import {expect} from 'chai';

describe('Test validator compilation',() => {
    it('Compile string validators', () => {
        let validator = defineValidator({
            valueType: APIValueType.String,
        }, {
           required: true,
           minLength: 3
        });

        let result = validator('1234 ', APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal('1234');
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrors.Required);
    });
    it('Compile boolean validators', () => {
        let validator = defineValidator({
            valueType: APIValueType.Boolean,
        }, {
            required: true,
            minLength: 3
        });

        let result = validator(true, APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(true);
        result = validator("Yes", APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(true);
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrors.TypeMismatch);
    });
    it('Compile integer validators', () => {
        let validator = defineValidator({
            valueType: APIValueType.Integer,
        }, {
            required: true
        });

        let result = validator(12345, APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(12345);
        result = validator("123256", APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.errorCode).equal(ValidationErrors.ValueCleanedUp);
        expect(result.value).equal(123256);
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrors.InvalidFormat);
        let negativeResultInvalidTypeCheck = validator('123.256', APIValueSourceType.Body);
        expect(negativeResultInvalidTypeCheck.isSuccess).equal(false);
        expect(negativeResultInvalidTypeCheck.errorCode).equal(ValidationErrors.TypeMismatch);
    });
    it('Compile float validators', () => {
        let validator = defineValidator({
            valueType: APIValueType.Float,
        }, {
            required: true
        });

        let result = validator(12345, APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(12345);
        result = validator("123.256", APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.errorCode).equal(ValidationErrors.ValueCleanedUp);
        expect(result.value).equal(123.256);
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrors.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrors.InvalidFormat);
    });
    it('Compile object validator', () => {
       let validator = defineValidator({
           valueType: APIValueType.Object,
           properties: {
               userName: {
                   valueType: {
                       valueType: APIValueType.String,
                   },
                   minLength: 3,
                   required: true,
               },
               password: {
                   valueType: {
                       valueType: APIValueType.String,
                   },
                   minLength: 8,
                   required: true,
               },
               rememberMe: {
                   valueType: {
                       valueType: APIValueType.Boolean
                   },
                   defaultValue: false
               }
           }
       }, null);
       let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, APIValueSourceType.Body);
       expect(positiveResult.isSuccess).equal(true);
    });
});