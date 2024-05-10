import { CA } from "./CA";

export class NdekiSite {
    constructor(
        public nomSite?: string,
          public delta?: number,
          public nur?: number,
          public oss?: string,
          public encours?: number,
          public lng?: string,
          public lat?: string,
          public age?: number,
          public ci?: string,
          public date?: string,
          public typeNRJ?: string,
          public categ?: string,
          public priorite?: string,
          public GDS?: boolean,
          public qowisio?: number
        ){

    }
}