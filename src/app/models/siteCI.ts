import { CA } from "./CA";

export class SiteCI {

    constructor(
        public id?: string,
        public nomSite?: string,
        public longitude?: number,
        public latitude?: number,
        public region?: string,
        public CI?: string,
        public typeNRJ?: string,
        public oss?: string
        ){

    }
}