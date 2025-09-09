export interface ApiResult<T> {
  data: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filterColumn?: string | null;
  filterQuery?: string | null;
}
