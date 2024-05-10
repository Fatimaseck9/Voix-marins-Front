export class Task {

    constructor(
        public id?: string,
        public name?: string,
        public description?: string,
        public owner?: string,
        public priority?: string,
        public structure?: string,
        public start?: Date,
        public end?: Date,
        public taskTableId?: string
        ){

    }
}