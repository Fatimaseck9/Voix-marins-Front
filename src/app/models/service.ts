import { Departement } from "./departement";


export class Service {
    constructor( 
        public id?: string,
        public code?: string,
        public departement?: Departement
    ){
    }
}