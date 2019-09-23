import {APIStructure, defineAPIStructure} from "./api-structure";

import { setCodeRoot} from "./modules-resolver";

import { compileValidator, ValidationErrorCodes } from './request-validator';
import {IAPIStructure} from "./definition-interfaces";


export const definePIStructure = (structureDefinition: IAPIStructure): APIStructure =>  defineAPIStructure(structureDefinition);

export const loadAPIStructureFromJSON = (objectJSON:any): APIStructure => {
    if (typeof (objectJSON) === 'string') {
        objectJSON = JSON.parse(objectJSON);
    }
    return definePIStructure(objectJSON);
};

export const bindsCodeRoot = setCodeRoot;

export const defineValidator = compileValidator;
export const ValidationErrors = ValidationErrorCodes;