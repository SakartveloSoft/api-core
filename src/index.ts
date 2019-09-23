import { defineAPIStructure, APIStructure} from "./api-structure";

export { HttpVerb  } from "./definition-interfaces";

export {APIStructure, defineAPIStructure} from "./api-structure";

export { setCodeRoot} from "./modules-resolver";

export { compileValidator, ValidationErrorCodes } from './request-validator';
export {IAPIStructure} from "./definition-interfaces";
export {IHostingEnvironment} from "./api-interfaces";


export const loadAPIStructureFromJSON = (objectJSON:any): APIStructure => {
    if (typeof (objectJSON) === 'string') {
        objectJSON = JSON.parse(objectJSON);
    }
    return defineAPIStructure(objectJSON);
};

export {APIApplication} from './application';


