"use client"

import {useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";

export default function Page() {
    const {dashboardApiIsLocal, dashboardAuthApiIsLocal} = useContext(ApiContext);
    return (
        <div>

            <div>{dashboardAuthApiIsLocal ? "Auth local" : "Auth render"}</div>
            <div>{dashboardApiIsLocal ? "Data local" : "Data render"}</div>
            <div>hello world</div>
        </div>
    )
}