import {RoleRead} from "./role";

export type UserInfo = {
    id : string,
    email : string,
    profileImageUrl : string | null,
    roleReads : RoleRead[]
}