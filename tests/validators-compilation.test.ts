import {defineValidator, ValidationErrors } from '../src';
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
});