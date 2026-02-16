import {UserInfo} from "./userInfo";

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user : UserInfo | null;
}