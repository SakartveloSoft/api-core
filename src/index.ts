import { defineAPIStructure} from "./api-structure";

import { setCodeRoot} from "./modules-resolver";

import { compileValidator, ValidationErrorCodes } from './request-validator';


export const definePIStructure = defineAPIStructure;

export const bindsCodeRoot = setCodeRoot;

export const defineValidator = compileValidator;
export const ValidationErrors = ValidationErrorCodes;