export class ActionLog {
    constructor(
        public module?: string,
        public user?: string,
        public action?: string,
        public date?: Date,
        public instance?: string,
        public key?: string,
        public infos?: string
    ){
    }
}