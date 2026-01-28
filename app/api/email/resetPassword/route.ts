import {NextRequest, NextResponse} from "next/server";
import {HttpStatusEnum} from "@/app/models/httpStatusEnum";

export async function POST(request : NextRequest) {
    return NextResponse.json(
        {status : HttpStatusEnum.OK},
        {statusText : 'reset password'}
    );

}