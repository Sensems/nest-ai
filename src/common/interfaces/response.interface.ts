export interface ResponseData<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  list: T[];
  pagination: PaginationMeta;
}

export type PaginatedResponse<T> = ResponseData<PaginatedData<T>>;
