import {compileValidator, ValidationErrorCodes} from '../src';
import {APIValueSourceType, APIValueType} from "../src/definition-interfaces";
import {expect} from 'chai';

describe('Test validator compilation',() => {
    it('Compile string validators', () => {
        let validator = compileValidator({
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
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrorCodes.Required);
    });
    it('Compile boolean validators', () => {
        let validator = compileValidator({
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
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrorCodes.TypeMismatch);
    });
    it('Compile integer validators', () => {
        let validator = compileValidator({
            valueType: APIValueType.Integer,
        }, {
            required: true
        });

        let result = validator(12345, APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(12345);
        result = validator("123256", APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.errorCode).equal(ValidationErrorCodes.ValueCleanedUp);
        expect(result.value).equal(123256);
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrorCodes.InvalidFormat);
        let negativeResultInvalidTypeCheck = validator('123.256', APIValueSourceType.Body);
        expect(negativeResultInvalidTypeCheck.isSuccess).equal(false);
        expect(negativeResultInvalidTypeCheck.errorCode).equal(ValidationErrorCodes.TypeMismatch);
    });

    it('Compile float validators', () => {
        let validator = compileValidator({
            valueType: APIValueType.Float,
        }, {
            required: true
        });

        let result = validator(12345, APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.value).equal(12345);
        result = validator("123.256", APIValueSourceType.Body);
        expect(result.isSuccess).equal(true);
        expect(result.errorCode).equal(ValidationErrorCodes.ValueCleanedUp);
        expect(result.value).equal(123.256);
        let negativeResultRequiredCheck = validator(null, APIValueSourceType.Body);
        expect(negativeResultRequiredCheck.isSuccess).equal(false);
        expect(negativeResultRequiredCheck.errorCode).equal(ValidationErrorCodes.Required);
        let negativeResultInvalidCheck = validator('blah blah blah', APIValueSourceType.Body);
        expect(negativeResultInvalidCheck.isSuccess).equal(false);
        expect(negativeResultInvalidCheck.errorCode).equal(ValidationErrorCodes.InvalidFormat);
    });

    it('Compile object validator', () => {
       let validator = compileValidator({
           valueType: APIValueType.Object,
           properties: {
               userName: {
                   valueSchema: {
                       valueType: APIValueType.String,
                   },
                   minLength: 3,
                   required: true,
               },
               password: {
                   valueSchema: {
                       valueType: APIValueType.String,
                   },
                   minLength: 8,
                   required: true,
               },
               rememberMe: {
                   valueSchema: {
                       valueType: APIValueType.Boolean
                   },
                   defaultValue: false
               }
           }
       }, null);
       let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, APIValueSourceType.Body);
       expect(positiveResult.isSuccess).equal(true);
    });

    it('Compile type validator by aliases', () => {
        let validator = compileValidator({
            valueType: APIValueType.Object,
            properties: {
                userName: {
                    valueSchemaAlias: APIValueType.String,
                    minLength: 3,
                    required: true,
                },
                password: {
                    valueSchemaAlias: APIValueType.String,
                    minLength: 8,
                    required: true,
                },
                rememberMe: {
                    valueSchemaAlias: APIValueType.Boolean,
                    defaultValue: false
                }
            }
        }, null);
        let positiveResult = validator({ userName: 'test', password: "GUID-t3st", rememberMe: true }, APIValueSourceType.Body);
        expect(positiveResult.isSuccess).equal(true);
        expect(positiveResult.value).an('object');
        expect(positiveResult.value.rememberMe).equal(true);
    });

});