import {UserInfo} from "./userInfo";

export type AuthResponse = {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user : UserInfo | null;
}