"use client"

import {ChevronLeft, ChevronRight} from 'lucide-react';
import Link from 'next/link';
import {ReadonlyURLSearchParams, usePathname, useSearchParams} from 'next/navigation';
import {Button} from "@/app/ui/base/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink
} from "@/app/ui/base/pagination";
import {generatePagination} from "@/app/lib/utils";
import {useDebugTranslations} from "@/app/lib/i18n/useDebugTranslations";

export default function InvoicesPagination({ totalPages }: { totalPages: number }) {
    const t = useDebugTranslations("dashboard.controls.pagination");
    const pathname: string = usePathname();
    const searchParams: ReadonlyURLSearchParams = useSearchParams();
    const currentPage: number = Number(searchParams.get('page')) || 1;
    const allPages : (string | number)[] = generatePagination(currentPage, totalPages);

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage <= 1}
                    >
                        {currentPage > 1 ? (
                            <Link href={createPageURL(currentPage - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">{t('previous')}</span>
                            </Link>
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">{t('previous')}</span>
                            </>
                        )}
                    </Button>
                </PaginationItem>

                {allPages.map((page, index) => (
                    <PaginationItem key={`${page}-${index}`}>
                        {page === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href={createPageURL(page)}
                                isActive={currentPage === page}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage >= totalPages}
                    >
                        {currentPage < totalPages ? (
                            <Link href={createPageURL(currentPage + 1)}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">{t('next')}</span>
                            </Link>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">{t('next')}</span>
                            </>
                        )}
                    </Button>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}