import {UserRead} from "@/app/models/user/userRead";
import {PageResponse} from "@/app/models/page/pageResponse";
import {isPage} from "@/app/typeValidators/pageResponseValidator";

export function isUserRead(x : any) : x is UserRead {
    return x && typeof x === "object"
        && typeof x.name === "string"
        && typeof x.email === "string"
        && typeof x.password === "string";
}

export function mapToUserRead(x : unknown) : UserRead | null {
   if (isUserRead(x)) {
       return {
           id : String(x.id),
           name : x.name,
           email : x.email,
           password : x.password
       };
   }
   return null;
}

export function mapToUserReadPage(x : unknown) : PageResponse<UserRead> | null {
    if (isPage(x)) {
        const mappedData : UserRead[] = [];

        if (Array.isArray(x.data)) {
            for (const item of x.data) {
                const mapped : UserRead | null = mapToUserRead(item);
                if (mapped == null) {
                    return null; // Invalid item in array
                }
                mappedData.push(mapped);
            }
        } else {
            return null; // data is not array
        }

        return {
            totalPages : Number(x.totalPages),
            currentPage : Number(x.currentPage),
            itemsPerPage : Number(x.itemsPerPage),
            data : mappedData
        };
    }
    return null;
}