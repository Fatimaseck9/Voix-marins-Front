import { Role } from "./role";
import { Agent } from "./agent";

export class Account {
  
    constructor( 
        public id?: string,
        public disabled?: string,
        public username?: string,        
        public password?: string,
        public lastLogin?: Date,
        public nom?: string,
        public prenom?: string,
        public telephone?: string,
        public departement?: string,
        public email?: string,
        public roles?: Role[],
        public agentId?: string,
        public agent?: Agent,
        public isActive?: boolean,
    ){
    }
}