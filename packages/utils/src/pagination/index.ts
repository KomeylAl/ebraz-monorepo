export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function getSkipTake({ page, pageSize }: PaginationParams) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function buildPaginationMeta(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: getTotalPages(total, pageSize),
  };
}
