import Link from "next/link";
import {ShieldAlert} from "lucide-react";

type Props = {
    searchParams: Promise<{ from?: string }>;
};

export default async function Unauthorized({ searchParams } : Props) {
    const {from} = await searchParams;
    return (
        <main className="flex h-full flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-10 text-gray-400" />
            <h2 className="text-xl font-semibold">403 Unauthorized</h2>
            <p>You do not have permission to access this resource.</p>
            <div className="mt-4 flex w-48 flex-col gap-2">
                {from && from.length > 0 && (
                    <Link
                        href={from}
                        className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400"
                    >
                        Go back
                    </Link>
                )}
                <Link
                    href="/dashboard"
                    className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400"
                >
                    Go to Dashboard
                </Link>
                <Link href={"/"}
                      className="rounded-md bg-blue-500 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-400">
                    Go to Homepage
                </Link>
            </div>
        </main>
    );
}