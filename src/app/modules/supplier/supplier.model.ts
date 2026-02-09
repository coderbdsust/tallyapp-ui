export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  outstandingBalance: number;
  totalPurchaseAmount:number;
  totalPaid:number;
  totalDue:number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  dueDate: string;
  totalAmount: number;
  totalPaid: number;
  dueAmount: number;
  description: string;
  reference: string;
  status: string;
  supplierId: string;
  supplierName: string;
  payments: PurchaseOrderPayment[];
}

export interface PurchaseOrderPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

export interface PurchaseOrderListItem {
  id: string;
  poNumber: string;
  orderDate: string;
  dueDate: string;
  totalAmount: number;
  totalPaid: number;
  dueAmount: number;
  status: string;
  supplierName: string;
}
