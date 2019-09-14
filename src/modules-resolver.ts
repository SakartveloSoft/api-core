import {join} from 'path';
let codeRoot: string = null;
export function setCodeRoot(path: string) {
    codeRoot = path;
}
export function resolveModule(path: string): any {
    if (path.startsWith('~/')) {
        path = join(codeRoot, path.substring(2));
    }
    return require(path);
}