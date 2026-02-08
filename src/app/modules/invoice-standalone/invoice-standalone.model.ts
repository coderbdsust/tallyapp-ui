// src/app/features/invoice-standalone/invoice-standalone.model.ts

export interface InvoiceStandalone {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  deliveryDate: string;
  invoiceStatus: InvoiceStatus;
  invoiceType: InvoiceType;
  barcode?: string;
  organization: OrganizationInfo;
  customer: CustomerData;
  products: ProductsData;
  payments: PaymentsData;
  pricing: PricingData;
  metadata?: MetaData;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  isFullyPaid: boolean;
}

export interface OrganizationInfo {
  id: string;
  orgName: string;
  orgAddressLine: string;
  orgAddressPostcode: string;
  orgTinNumber: string;
  orgVatNumber: string;
  orgEmail: string;
  orgMobileNo: string;
  logoB64?: string;
}

export interface CustomerData {
  customerId?: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  postcode?: string;
  additionalInfo?: string;
}

export interface ProductsData {
  items: ProductItem[];
}

export interface ProductItem {
  itemId: string;
  productId?: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  unitType: string;
  quantity: number;
  pricePerUnit: number;
  discountPercent:number;
  totalAmount:number;
  notes?: string;
}

export interface PaymentsData {
  payments: PaymentItem[];
}

export interface PaymentItem {
  paymentId: string;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  amount: number;
  status: string;
  notes?: string;
}

export interface PricingData {
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  vatRate: number;
  vatAmount: number;
  discount: number;
  deliveryCharge: number;
}

export interface MetaData {
  notes?: string;
  terms?: string;
  validUntil?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  tags?: string[];
  customField1?: string;
  customField2?: string;
  customField3?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  QUOTATION = 'QUOTATION',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID'
}

export enum InvoiceType {
  QUOTATION = 'QUOTATION',
  BILL = 'BILL'
}

export interface InvoiceStandaloneTableResponse {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceStatus: InvoiceStatus;
  invoiceType: InvoiceType;
  customerName?: string;
  customerMobile?: string;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
}

// Request DTOs
export interface CreateInvoiceRequest {
  organizationId: string;
  invoiceType: InvoiceType;
}

export interface UpdateCustomerRequest {
  customerId?: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  postcode?: string;
  additionalInfo?: string;
}

export interface AddProductRequest {
  productId?: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  unitType: string;
  quantity: number;
  pricePerUnit: number;
  discountPercent: number;
  notes?: string;
}

export interface UpdateProductRequest {
  itemId: string;
  name: string;
  code?: string;
  description?: string;
  category?: string;
  unitType: string;
  quantity: number;
  pricePerUnit: number;
  notes?: string;
}

export interface RemoveProductRequest {
  itemId: string;
}

export interface AddPaymentRequest {
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  amount: number;
  notes?: string;
}

export interface UpdatePricingRequest {
  discount?: number;
  deliveryCharge?: number;
  invoiceStatus?: InvoiceStatus;
  invoiceDate?: string;
  deliveryDate?: string;
}