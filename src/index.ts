import { defineAPIStructure, APIStructure} from "./api-structure";
import {IAPIUrlTemplate} from "./api-interfaces";

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

export {APIRequest} from './pipeline';

export {IAPIUrlTemplate} from './api-interfaces';

export {makeUrlTemplate, APIRouter} from './routing'

export {APIApplication} from './application';


