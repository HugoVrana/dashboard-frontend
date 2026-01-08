'use client'

import { logout } from '@/app/lib/actions';
import { PowerIcon } from '@heroicons/react/24/outline';
import {useActionState, useContext} from "react";
import {ApiContext} from "@/app/lib/devOverlay/apiContext";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";

export default function LogoutButton() {
    const { dashboardAuthApiIsLocal } = useContext(ApiContext);
    const url : string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();
    const logoutWithUrl : (prevState: any, formData: FormData) => Promise<any> = logout.bind("url", url);
    const [errorMessage, formAction, isPending] = useActionState(
        logoutWithUrl,
        undefined,
    )

    return (
        <form action={formAction}>
            <button className="...">
                <PowerIcon className="w-6" />
                <div className="hidden md:block">Sign Out</div>
            </button>
        </form>
    );
}