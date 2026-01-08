import {RoleRead} from "./role";

export type UserInfo = {
    id : string,
    email : string,
    roleReads : RoleRead[]
}