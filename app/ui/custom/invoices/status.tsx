import clsx from 'clsx';
import {CheckIcon, ClockIcon} from "lucide-react";
import {useDebugTranslations} from "@/app/lib/devOverlay/useDebugTranslations";

export default function InvoiceStatus({ status }: { status: string }) {
    const t = useDebugTranslations("dashboard.controls.status");
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-1 text-xs',
          {
            'bg-gray-100 text-gray-500': status === 'pending',
            'bg-green-500 text-white': status === 'paid',
          },
        )}
      >
        {status === 'pending' && (
            <>
                {t('pending')}
                <ClockIcon className="ml-1 w-4 text-gray-500" />
            </>
        )}
          {status === 'paid' && (
              <>
                  {t('paid')}
                  <CheckIcon className="ml-1 w-4 text-white" />
              </>
          )}
      </span>
    );
}
