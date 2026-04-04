export interface CreateReturnRequest {
  reason?: string;
  refundType: RefundType;
  taxPercent?: number;
  vatPercent?: number;
}

export interface AddReturnItemRequest {
  productCode: string;
  quantityReturned: number;
  pricePerUnit: number;
  discountPercent?: number;
  productCondition: ProductCondition;
}

export interface ReturnItem {
  id: string;
  quantityReturned: number;
  pricePerUnit: number;
  discountPercent: number;
  productCondition: ProductCondition;
  lineSubtotal: number;
  discountAmount: number;
  lineTotal: number;
  productCode: string;
  productName: string;
  batchNumber: string;
}

export interface ProductReturnResponse {
  id: string;
  returnNumber: string;
  returnDate: string;
  reason: string;
  refundType: RefundType;
  taxPercent: number;
  vatPercent: number;
  subTotal: number;
  taxAmount: number;
  vatAmount: number;
  refundAmount: number;
  status: ReturnStatus;
  customerName: string;
  items: ReturnItem[];
}

export type RefundType = 'CREDIT_TO_BALANCE' | 'CASH_REFUND';
export type ProductCondition = 'RESTORABLE' | 'BROKEN';
export type ReturnStatus = 'DRAFT' | 'APPROVED' | 'DELETED';
