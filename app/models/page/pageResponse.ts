export type PageResponse<T> = {
    totalPages : number;
    currentPage : number;
    itemsPerPage : number;
    data : T[];
}