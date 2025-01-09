export interface PageResponse<T = any> {
    content: T[];
    pageNo:number;
    size:number;
    totalElements:number;
    totalPages:number;
    first:boolean;
    last:boolean;
}