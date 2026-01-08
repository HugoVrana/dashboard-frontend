import {Grant} from "./grant";

export type RoleRead = {
    id : string,
    name : string;
    grants : Grant[];
}