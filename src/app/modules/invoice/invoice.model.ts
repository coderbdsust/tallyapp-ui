import { Organization } from "../../core/models/organization.model";

export interface Invoice {
    id: string;
    barcode:string;
    invoiceNumber: string;
    invoiceDate: string;
    deliveryDate: string | null;
    deliveryCharge: number;
    totalDiscount: number;
    invoiceStatus: string;
    customer: Customer | null;
    ownerOrganization: Organization;
    productSales: ProductSale[];
    payments: Payment[];
    totalPaid: number;
    productSubTotal: number;
    productTotalTax: number;
    productTotalVat: number;
    totalAmount: number;
    remainingAmount: number;
    fullyPaid: boolean;
    vatRate:number|0;
    taxRate:number|0;
}
export interface Customer {
    id: string;
    name: string;
    email: string;
    mobile: string;
    billingAddressLine?: string;
    billingCity?: string;
    billingPostcode?: string;
    billingCountry?: string;
    deliveryAddressLine?: string;
    deliveryCity?: string;
    deliveryPostcode?: string;
    deliveryCountry?: string;
    openingDue?: number;
    effectiveBalance?: number;
    totalInvoice:number;
    totalAmount: number;
    totalDueAmount: number;
    totalPaidAmount: number;
    balance?: number;
}

export interface CustomerDetail {
    id: string;
    name: string;
    email: string;
    mobile: string;
    billingAddressLine?: string;
    billingCity?: string;
    billingPostcode?: string;
    billingCountry?: string;
    deliveryAddressLine?: string;
    deliveryCity?: string;
    deliveryPostcode?: string;
    deliveryCountry?: string;
    openingDue?: number;
    effectiveBalance?: number;
    totalInvoice: number;
    paidInvoiceCount: number;
    unpaidInvoiceCount: number;
    totalAmount: number;
    totalDueAmount: number;
    totalPaidAmount: number;
    balance?: number;
    customerPayments?: CustomerPayment[];
    invoices: CustomerInvoice[];
}

export interface CustomerInvoice {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceStatus: string;
    totalAmount: number;
    totalPaid?: number;
    remainingAmount?: number;
    payments?: Payment[];
}

export interface CustomerPayment {
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string;
    notes: string;
    status: string;
}

export interface ProductSale {
    id: string;
    quantitySold: number;
    pricePerUnit: number;
    discountPercent: number;
    soldDate: string;
    totalAmount: number;
    code:string;
    description:string;
    unitType:string;
    name:string;
}

export interface Payment {
    id:string;
    amount:number;
    paymentDate:Date;
    paymentMethod:string;
    reference:string;
}
