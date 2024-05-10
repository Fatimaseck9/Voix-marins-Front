import { Service } from "./service";

/**
 * Created by jobmbay on 2/2/18.
 */
export class Departement {
  constructor(
    public id?: string,
    public code?: string,
    public services?: Service[]
  ){
  }
}
