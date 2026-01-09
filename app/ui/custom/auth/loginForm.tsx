import { ApiContext } from "@/app/lib/devOverlay/apiContext";
import { useSearchParams } from "next/navigation";
import {useActionState, useContext} from "react";
import {getDashboardAuthLocalUrl, getDashboardAuthRenderUrl} from "@/app/lib/devOverlay/dashboardAuthApiContext";
import {ArrowRightIcon, AtSign, KeyIcon, ShieldAlert} from "lucide-react";
import {Button} from "@/app/ui/base/button";
import {login} from "@/app/lib/actions";
import {Input} from "@/app/ui/base/input";
import {ThemeContext} from "@/app/lib/theme/themeContext";


export default function LoginForm() {
  const searchParams = useSearchParams();
  const { dashboardAuthApiIsLocal } = useContext(ApiContext);
  const { isDark } = useContext(ThemeContext);
  const url : string = dashboardAuthApiIsLocal ? getDashboardAuthLocalUrl() : getDashboardAuthRenderUrl();

  const loginWithIsLocal: (prevState: any, formData: FormData) => Promise<any> = login.bind("url", url);
  const callbackUrl : string = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
      loginWithIsLocal,
      undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className={`flex-1 rounded-lg ${isDark ? 'dark' : ''} px-6 pb-4 pt-8`}>
        <h1 className={`mb-3 text-2xl ${isDark ? 'dark' : ''}`}>
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className={`mb-3 mt-5 block text-xs font-medium ${isDark ? 'dark' : ''}`}
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <Input
                className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 ${isDark ? 'dark' : ''}`}
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSign className={`pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${isDark ? 'dark' : ''}`} />
            </div>
          </div>
          <div className="mt-4">
            <label
              className={`mb-3 mt-5 block text-xs font-medium ${isDark ? 'dark' : ''}`}
              htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 ${isDark ? 'dark' : ''}`}
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}/>
              <KeyIcon className={`pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${isDark ? 'dark' : ''}`} />
            </div>
          </div>
        </div>
        <Input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true">
          {errorMessage && (
              <>
                <ShieldAlert className="h-5 w-5 text-red-500"/>
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
          )}
        </div>
      </div>
    </form>
  );
}
