export interface PaginationParams {
    page : number 
    limit : number 
    search? : string 
    sort? : string 
    order?: 'asc'| 'desc'
}

export interface PaginatedResult<T> {
    data : T[]
    total : number
    page : number
    limit: number
}