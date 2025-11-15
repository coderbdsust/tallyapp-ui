export interface CashType{
    id:string,
    displayName:string;
    description:string;
    isSystemDefault:boolean;
    accountType:string;
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

export enum CashTypeName {
  CASH_IN_TYPE = "CASH_IN_TYPE",
  CASH_OUT_TYPE = "CASH_OUT_TYPE",
  EMPLOYEE_EXPENSE_TYPE = "EMPLOYEE_EXPENSE_TYPE"
}
