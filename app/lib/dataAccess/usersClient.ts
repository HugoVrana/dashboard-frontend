"use client";

import GrafanaClient from "@/app/lib/dataAccess/grafanaClient";
import {UserRead} from "@/app/models/user/userRead";
import {getAuthToken} from "@/app/lib/permission/permissionsClient";
import {isUserRead, mapToUserRead} from "@/app/typeValidators/userValidator";

const grafanaClient : GrafanaClient = new GrafanaClient();

export async function getUserByEmail(url : string, email : string) : Promise<UserRead | null> {
    const u : URL = new URL("/users/email/" + email, url);
    try {
        const res: Response = await fetch(u.toString(), {
            headers: {
                Accept: "application/json",
                Authorization : `Bearer ${await getAuthToken()}`
            }
        });
        if (!res.ok) {
            grafanaClient.error("HTTP error", {route: "GET /users/email/" + email, status: res.status, statusText: res.statusText});
            console.error("HTTP error", res.status, res.statusText);
            return Promise.resolve(null);
        }

        const text : string = await res.text();
        if (!text || text.trim() === '') {
            grafanaClient.error("Empty response body, returning empty page", {route: "GET /users/email/" + email});
            console.log("Empty response body, returning empty page");
            return Promise.resolve(null);
        }

        const data : unknown = await JSON.parse(text);
        if (!isUserRead(data)) {
            grafanaClient.error("Unexpected payload:", {route: "GET /users/email/" + email, payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }

        const mappedData : UserRead | null = mapToUserRead(data);
        if (!mappedData){
            grafanaClient.error("Unexpected payload:", {route: "GET /users/email/" + email, payload: data});
            console.error("Unexpected payload:", data);
            return Promise.resolve(null);
        }

        grafanaClient.info("Fetched user", {route: "GET /users/email/" + email});
        return Promise.resolve(mappedData);
    } catch (e) {
        grafanaClient.error("Fetch failed", {route: "GET /users/email/" + email, error: e});
        console.error("Error processing response:", e);
        return Promise.resolve(null);
    }
}