import { Account } from "./account";
import { Service } from "./service";
import { Departement } from "./departement";

export class Agent {
    constructor(
        public id?: string,
        public matricule?: string,
        public nom?: string,
        public prenom?: string,
        public telephone1?: string,
        public telephone2?: string,
        public departementId?: string,
        public serviceId?: string,
        public service?: Service,
        public departement?: Departement,
        public account?:Account,
        public equipeCICFId?: string,
        public equipeVTOId?: string,
        public equipeVTO?: any,
        public zoneFibreId?: string,
        public zoneFibre?: any,
        public randKey?: string
    ){
    }
}
