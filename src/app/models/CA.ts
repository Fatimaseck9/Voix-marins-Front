import { SiteCI } from "./siteCI";

export class CA {

    constructor(
        public id?: string,
        public caData?: number,
        public caVoix?: number,
        public periode?: string,
        public active?: string,
        public siteCIId?: string,
        public siteCI?: SiteCI,
        public siteCellInfos?: any,
        public totalCA?: number,
        public di?: number,
        public c?: number,
        public cc?: number,
        public ib?: number,
        public nurB?: number,
        public ploss?: number,
        public prev?: number,
        public c2G?: number,
        public c3G?: number,
        public c4G?: number,
        public d2G?: number,
        public d3G?: number,
        public d4G?: number,
        public ib2G?: number,
        public ib3G?: number,
        public ib4G?: number,
        public cc2G?: number,
        public cc3G?: number,
        public cc4G?: number
        ){

    }
}