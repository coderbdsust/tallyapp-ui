export interface CashType{
    name: string;
    displayName:string;
    description:string;
}

export interface CashOutTypeRequest {
  name: string;
  displayName: string;
  description: string;
  category?: string;
  isActive: boolean;
  organizationId: string;
}

export interface CashOutTypeResponse {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category?: string;
  isActive: boolean;
  organizationId: string;
}