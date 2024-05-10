export class DatacastLog {

    constructor(
        public id?: string,
        public time?: Date,
        public protocol?: string,
        public destination?: string,
        public processID?: string,
        public clientStatus?: string,
        public NOF_DRS?: string
        ){

    }
}