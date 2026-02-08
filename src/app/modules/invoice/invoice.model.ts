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
    address: string;
    postcode: string;
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
