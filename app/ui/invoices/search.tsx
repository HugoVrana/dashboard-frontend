"use client"

import {Search as SearchIcon} from 'lucide-react';
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useDebouncedCallback} from "use-debounce";
import {useEffect, useState} from "react";
import { Input } from "@hugovrana/dashboard-frontend-shared/components";

export default function Search({ placeholder }: { placeholder: string }) {
    const searchParams = useSearchParams();
    const pathname : string = usePathname();
    const { replace } = useRouter();

    const [searchTerm, setSearchTerm] = useState('');

    // Sync state with URL params on mount and when URL changes
    useEffect(() => {
        setSearchTerm(searchParams.get('query') ?? '');
    }, [searchParams]);

    const handleSearch = useDebouncedCallback((term: string) => {
        console.log(`Searching... ${term}`);

        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearch(value);
    };

    return (
        <div className="relative flex flex-1 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                onChange={handleChange}
                value={searchTerm}
                className="pl-10"
            />
        </div>
    );
}