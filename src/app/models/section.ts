import { Role } from "./role";

export class Section {
    constructor(
        public id?: string,
        public idSection?: string,
        public module?: string,
        public view?: string,
        public roles?: Role[],
    ){
    }
}
