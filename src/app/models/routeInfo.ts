import { ChildrenItem } from "./childrenItems";

export class RouteInfos {
    constructor(
        public path?: string,
        public title?: string,
        public visible?: boolean,
        public type?: string,
        public icontype?: string,
        public collapse?: string,
        public index?: number,
        public children?: ChildrenItem[]
    ){
    }
}
