
export interface DriverBase {
  firstName: string;
  surname: string;
  emailAddress: string;
  telephoneNumber?: string | null;
}

export interface Driver extends DriverBase {
  id: number;
}

export interface DriverListResponse {
  data: Driver[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export type DriverCreateRequest = DriverBase;
export type DriverUpdateRequest = DriverBase;