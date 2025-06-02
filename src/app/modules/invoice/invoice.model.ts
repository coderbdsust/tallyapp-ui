export interface Invoice {
    id: string;
    invoiceId: string;
    invoiceDate: Date;
    customerName: string;
    customerMobile: string;
    totalAmount: number;
    totalDue: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}