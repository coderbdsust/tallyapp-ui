# API Request/Response Samples

> Base URL: `/tallyapp`
---

## 1. Supplier API

### 1.1 Create Supplier

**POST** `/supplier/v1/{organizationId}`

**Request:**
```json
{
  "name": "ABC Trading Co.",
  "phone": "01712345678",
  "email": "abc@trading.com",
  "addressLine": "123 Market Street, Dhaka"
}
```

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "ABC Trading Co.",
  "phone": "01712345678",
  "email": "abc@trading.com",
  "addressLine": "123 Market Street, Dhaka",
  "outstandingBalance": 0.0
}
```

### 1.2 Update Supplier (pass id in body)

**POST** `/supplier/v1/{organizationId}`

**Request:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "ABC Trading Co. Ltd",
  "phone": "01712345678",
  "email": "info@abctrading.com",
  "addressLine": "456 New Market Road, Dhaka"
}
```

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "ABC Trading Co. Ltd",
  "phone": "01712345678",
  "email": "info@abctrading.com",
  "addressLine": "456 New Market Road, Dhaka",
  "outstandingBalance": 0.0
}
```

### 1.3 Get Supplier by ID

**GET** `/supplier/v1/{organizationId}/{supplierId}`

**Response (200):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "ABC Trading Co. Ltd",
  "phone": "01712345678",
  "email": "info@abctrading.com",
  "addressLine": "456 New Market Road, Dhaka",
  "outstandingBalance": 5000.0
}
```

### 1.4 Search Suppliers (paginated)

**GET** `/supplier/v1/{organizationId}?search=ABC&page=0&size=10`

**Response (200):**
```json
{
  "content": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "ABC Trading Co. Ltd",
      "phone": "01712345678",
      "email": "info@abctrading.com",
      "addressLine": "456 New Market Road, Dhaka",
      "outstandingBalance": 5000.0
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "ABC Suppliers Inc.",
      "phone": "01898765432",
      "email": "contact@abcsuppliers.com",
      "addressLine": "78 Industrial Area, Chittagong",
      "outstandingBalance": 0.0
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

## 2. Purchase Order API

### 2.1 Create Purchase Order

**POST** `/purchase-order/v1/{organizationId}`

**Request:**
```json
{
  "supplierId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "totalAmount": 25000.00,
  "description": "Raw materials for Q1 production",
  "reference": "REF-2026-001",
  "orderDate": "2026-02-09",
  "dueDate": "2026-03-09"
}
```

**Response (200):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "poNumber": "PO_A1B2C3D4",
  "orderDate": "2026-02-09",
  "dueDate": "2026-03-09",
  "totalAmount": 25000.0,
  "totalPaid": 0.0,
  "dueAmount": 25000.0,
  "description": "Raw materials for Q1 production",
  "reference": "REF-2026-001",
  "status": "DRAFT",
  "supplierId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "supplierName": "ABC Trading Co. Ltd",
  "payments": []
}
```

### 2.2 Update Purchase Order (DRAFT only)

**PUT** `/purchase-order/v1/{organizationId}/{poId}`

**Request:**
```json
{
  "totalAmount": 27500.00,
  "description": "Raw materials for Q1 production (revised)",
  "dueDate": "2026-03-15"
}
```

**Response (200):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "poNumber": "PO_A1B2C3D4",
  "orderDate": "2026-02-09",
  "dueDate": "2026-03-15",
  "totalAmount": 27500.0,
  "totalPaid": 0.0,
  "dueAmount": 27500.0,
  "description": "Raw materials for Q1 production (revised)",
  "reference": "REF-2026-001",
  "status": "DRAFT",
  "supplierId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "supplierName": "ABC Trading Co. Ltd",
  "payments": []
}
```

### 2.3 Approve Purchase Order

> Triggers accounting: Dr. Regular Expenses $27,500 / Cr. Accounts Payable $27,500

**PUT** `/purchase-order/v1/{organizationId}/{poId}/approve`

**No request body required.**

**Response (200):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "poNumber": "PO_A1B2C3D4",
  "orderDate": "2026-02-09",
  "dueDate": "2026-03-15",
  "totalAmount": 27500.0,
  "totalPaid": 0.0,
  "dueAmount": 27500.0,
  "description": "Raw materials for Q1 production (revised)",
  "reference": "REF-2026-001",
  "status": "APPROVED",
  "supplierId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "supplierName": "ABC Trading Co. Ltd",
  "payments": []
}
```

### 2.4 Add Payment to Purchase Order

> Triggers accounting: Dr. Accounts Payable $10,000 / Cr. Cash $10,000
> Also validates sufficient cash balance before payment.

**POST** `/purchase-order/v1/{organizationId}/{poId}/payment`

**Request:**
```json
{
  "paymentAmount": 10000.00,
  "paymentDate": "2026-02-15",
  "paymentMethod": "Bank Transfer",
  "paymentRef": "TRX-BK-20260215"
}
```

**Response (200):**
```json
{
  "id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
  "amount": 10000.0,
  "paymentDate": "2026-02-15",
  "paymentMethod": "Bank Transfer",
  "reference": "TRX-BK-20260215"
}
```

### 2.5 Add Second Payment (PO becomes PARTIALLY_PAID)

**POST** `/purchase-order/v1/{organizationId}/{poId}/payment`

**Request:**
```json
{
  "paymentAmount": 17500.00,
  "paymentDate": "2026-03-01",
  "paymentMethod": "Cash",
  "paymentRef": "CASH-20260301"
}
```

**Response (200):**
```json
{
  "id": "e5f6a7b8-c9d0-1234-ef01-23456789abcd",
  "amount": 17500.0,
  "paymentDate": "2026-03-01",
  "paymentMethod": "Cash",
  "reference": "CASH-20260301"
}
```

### 2.6 Get Purchase Order (after payments - now PAID)

**GET** `/purchase-order/v1/{organizationId}/{poId}`

**Response (200):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "poNumber": "PO_A1B2C3D4",
  "orderDate": "2026-02-09",
  "dueDate": "2026-03-15",
  "totalAmount": 27500.0,
  "totalPaid": 27500.0,
  "dueAmount": 0.0,
  "description": "Raw materials for Q1 production (revised)",
  "reference": "REF-2026-001",
  "status": "PAID",
  "supplierId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "supplierName": "ABC Trading Co. Ltd",
  "payments": [
    {
      "id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
      "amount": 10000.0,
      "paymentDate": "2026-02-15",
      "paymentMethod": "Bank Transfer",
      "reference": "TRX-BK-20260215"
    },
    {
      "id": "e5f6a7b8-c9d0-1234-ef01-23456789abcd",
      "amount": 17500.0,
      "paymentDate": "2026-03-01",
      "paymentMethod": "Cash",
      "reference": "CASH-20260301"
    }
  ]
}
```

### 2.7 List Purchase Orders (paginated with filters)

**GET** `/purchase-order/v1/{organizationId}?status=APPROVED&search=&page=0&size=10`

> `status` filter values: `DRAFT`, `APPROVED`, `PARTIALLY_PAID`, `PAID`, `CANCELLED` (optional)
> `search` matches: PO number, description, supplier name

**Response (200):**
```json
{
  "content": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "poNumber": "PO_A1B2C3D4",
      "orderDate": "2026-02-09",
      "dueDate": "2026-03-15",
      "totalAmount": 27500.0,
      "totalPaid": 10000.0,
      "dueAmount": 17500.0,
      "status": "PARTIALLY_PAID",
      "supplierName": "ABC Trading Co. Ltd"
    },
    {
      "id": "f6a7b8c9-d0e1-2345-f012-3456789abcde",
      "poNumber": "PO_E5F6A7B8",
      "orderDate": "2026-02-05",
      "dueDate": "2026-02-28",
      "totalAmount": 8000.0,
      "totalPaid": 0.0,
      "dueAmount": 8000.0,
      "status": "APPROVED",
      "supplierName": "XYZ Wholesale"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 2,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### 2.8 Delete Payment from Purchase Order

> Triggers reversal: Creates REVERSAL transaction, records REFUND_RECEIVED cash flow.

**DELETE** `/purchase-order/v1/{organizationId}/{poId}/payment/{paymentId}`

**No request body.**

**Response (200):**
```json
{
  "sucs": true,
  "message": "Payment deleted successfully",
  "userDetail": null,
  "businessCode": 200
}
```

### 2.9 Cancel Purchase Order

> Reverses the PURCHASE transaction (Dr. A/P, Cr. Expense). Must delete all payments first.

**PUT** `/purchase-order/v1/{organizationId}/{poId}/cancel`

**No request body.**

**Response (200):**
```json
{
  "sucs": true,
  "message": "Purchase order cancelled successfully",
  "userDetail": null,
  "businessCode": 200
}
```

**Error (has active payments):**
```json
{
  "sucs": false,
  "message": "Cannot cancel a purchase order with active payments. Delete payments first.",
  "userDetail": null,
  "businessCode": 600
}
```

---

## 3. Universal Statement API

### 3.1 All Entities Statement

**GET** `/accounting/v1/{organizationId}/universal-statement?entityType=ALL&startDate=2026-01-01&endDate=2026-12-31&page=0&size=20`

> Query Params:
> - `entityType`: `ALL` | `CUSTOMER` | `SUPPLIER` | `EMPLOYEE` (default: `ALL`)
> - `entityId`: UUID (optional - filter to specific customer/supplier/employee)
> - `startDate`: `yyyy-MM-dd` (default: Jan 1 of current year)
> - `endDate`: `yyyy-MM-dd` (default: Dec 31 of current year)
> - `includeReversed`: `true` | `false` (default: `false`)
> - `page`: int (default: `0`)
> - `size`: int (default: `20`)

**Response (200):**
```json
{
  "orgId": "11111111-2222-3333-4444-555555555555",
  "orgName": "My Business Ltd",
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-12-31T23:59:59",
  "entityType": "ALL",
  "entityName": null,
  "entityId": null,
  "totalDebit": 62500.0,
  "totalCredit": 37500.0,
  "netBalance": 25000.0,
  "entries": {
    "content": [
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0001",
        "transactionNumber": "SALE_1A2B3C4D",
        "transactionDate": "2026-01-15T10:30:00",
        "transactionType": "SALE",
        "amount": 15000.0,
        "description": "Sale - Invoice: INV-0001",
        "reference": "INV-0001",
        "isReversed": false,
        "entityType": "CUSTOMER",
        "entityName": "John Doe",
        "entityId": "cust-1111-2222-3333-444444444444",
        "debitAccountName": "Accounts Receivable",
        "creditAccountName": "Sales Revenue",
        "debitAmount": 15000.0,
        "creditAmount": null,
        "runningBalance": 15000.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0002",
        "transactionNumber": "PAYRCV_5E6F7A8B",
        "transactionDate": "2026-01-20T14:00:00",
        "transactionType": "PAYMENT_RECEIVED",
        "amount": 15000.0,
        "description": "Payment Received - PAY-001",
        "reference": "PAY-001",
        "isReversed": false,
        "entityType": "CUSTOMER",
        "entityName": "John Doe",
        "entityId": "cust-1111-2222-3333-444444444444",
        "debitAccountName": "Cash",
        "creditAccountName": "Accounts Receivable",
        "debitAmount": null,
        "creditAmount": 15000.0,
        "runningBalance": 30000.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0003",
        "transactionNumber": "PURCH_9C0D1E2F",
        "transactionDate": "2026-02-01T09:00:00",
        "transactionType": "PURCHASE",
        "amount": 27500.0,
        "description": "Purchase - PO: PO_A1B2C3D4",
        "reference": "PO_A1B2C3D4",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Regular Expenses",
        "creditAccountName": "Accounts Payable",
        "debitAmount": null,
        "creditAmount": 27500.0,
        "runningBalance": 57500.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0004",
        "transactionNumber": "PAYMADE_3G4H5I6J",
        "transactionDate": "2026-02-15T11:30:00",
        "transactionType": "PAYMENT_MADE",
        "amount": 10000.0,
        "description": "Payment Made - TRX-BK-20260215",
        "reference": "TRX-BK-20260215",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Accounts Payable",
        "creditAccountName": "Cash",
        "debitAmount": 10000.0,
        "creditAmount": null,
        "runningBalance": 67500.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0005",
        "transactionNumber": "EEEXP_7K8L9M0N",
        "transactionDate": "2026-02-20T16:00:00",
        "transactionType": "EMPLOYEE_EXPENSE",
        "amount": 5000.0,
        "description": "Rahim Khan - Office Supplies",
        "reference": "REC-0042",
        "isReversed": false,
        "entityType": "EMPLOYEE",
        "entityName": "Rahim Khan",
        "entityId": "emp-1111-2222-3333-444444444444",
        "debitAccountName": "Employee Regular Expenses",
        "creditAccountName": "Cash",
        "debitAmount": 5000.0,
        "creditAmount": null,
        "runningBalance": 72500.0
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 5,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

### 3.2 Supplier-Only Statement

**GET** `/accounting/v1/{organizationId}/universal-statement?entityType=SUPPLIER&startDate=2026-01-01&endDate=2026-12-31`

**Response (200):**
```json
{
  "orgId": "11111111-2222-3333-4444-555555555555",
  "orgName": "My Business Ltd",
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-12-31T23:59:59",
  "entityType": "SUPPLIER",
  "entityName": null,
  "entityId": null,
  "totalDebit": 10000.0,
  "totalCredit": 27500.0,
  "netBalance": -17500.0,
  "entries": {
    "content": [
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0003",
        "transactionNumber": "PURCH_9C0D1E2F",
        "transactionDate": "2026-02-01T09:00:00",
        "transactionType": "PURCHASE",
        "amount": 27500.0,
        "description": "Purchase - PO: PO_A1B2C3D4",
        "reference": "PO_A1B2C3D4",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Regular Expenses",
        "creditAccountName": "Accounts Payable",
        "debitAmount": null,
        "creditAmount": 27500.0,
        "runningBalance": 27500.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0004",
        "transactionNumber": "PAYMADE_3G4H5I6J",
        "transactionDate": "2026-02-15T11:30:00",
        "transactionType": "PAYMENT_MADE",
        "amount": 10000.0,
        "description": "Payment Made - TRX-BK-20260215",
        "reference": "TRX-BK-20260215",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Accounts Payable",
        "creditAccountName": "Cash",
        "debitAmount": 10000.0,
        "creditAmount": null,
        "runningBalance": 37500.0
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

### 3.3 Specific Supplier Statement

**GET** `/accounting/v1/{organizationId}/universal-statement?entityType=SUPPLIER&entityId=a1b2c3d4-e5f6-7890-abcd-ef1234567890&startDate=2026-01-01&endDate=2026-12-31`

**Response (200):**
```json
{
  "orgId": "11111111-2222-3333-4444-555555555555",
  "orgName": "My Business Ltd",
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-12-31T23:59:59",
  "entityType": "SUPPLIER",
  "entityName": "ABC Trading Co. Ltd",
  "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "totalDebit": 10000.0,
  "totalCredit": 27500.0,
  "netBalance": -17500.0,
  "entries": {
    "content": [
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0003",
        "transactionNumber": "PURCH_9C0D1E2F",
        "transactionDate": "2026-02-01T09:00:00",
        "transactionType": "PURCHASE",
        "amount": 27500.0,
        "description": "Purchase - PO: PO_A1B2C3D4",
        "reference": "PO_A1B2C3D4",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Regular Expenses",
        "creditAccountName": "Accounts Payable",
        "debitAmount": null,
        "creditAmount": 27500.0,
        "runningBalance": 27500.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0004",
        "transactionNumber": "PAYMADE_3G4H5I6J",
        "transactionDate": "2026-02-15T11:30:00",
        "transactionType": "PAYMENT_MADE",
        "amount": 10000.0,
        "description": "Payment Made - TRX-BK-20260215",
        "reference": "TRX-BK-20260215",
        "isReversed": false,
        "entityType": "SUPPLIER",
        "entityName": "ABC Trading Co. Ltd",
        "entityId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "debitAccountName": "Accounts Payable",
        "creditAccountName": "Cash",
        "debitAmount": 10000.0,
        "creditAmount": null,
        "runningBalance": 37500.0
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

### 3.4 Customer-Only Statement

**GET** `/accounting/v1/{organizationId}/universal-statement?entityType=CUSTOMER`

**Response (200):**
```json
{
  "orgId": "11111111-2222-3333-4444-555555555555",
  "orgName": "My Business Ltd",
  "startDate": "2026-01-01T00:00:00",
  "endDate": "2026-12-31T23:59:59",
  "entityType": "CUSTOMER",
  "entityName": null,
  "entityId": null,
  "totalDebit": 15000.0,
  "totalCredit": 15000.0,
  "netBalance": 0.0,
  "entries": {
    "content": [
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0001",
        "transactionNumber": "SALE_1A2B3C4D",
        "transactionDate": "2026-01-15T10:30:00",
        "transactionType": "SALE",
        "amount": 15000.0,
        "description": "Sale - Invoice: INV-0001",
        "reference": "INV-0001",
        "isReversed": false,
        "entityType": "CUSTOMER",
        "entityName": "John Doe",
        "entityId": "cust-1111-2222-3333-444444444444",
        "debitAccountName": "Accounts Receivable",
        "creditAccountName": "Sales Revenue",
        "debitAmount": 15000.0,
        "creditAmount": null,
        "runningBalance": 15000.0
      },
      {
        "id": "aaa11111-bbbb-cccc-dddd-eeeeeeee0002",
        "transactionNumber": "PAYRCV_5E6F7A8B",
        "transactionDate": "2026-01-20T14:00:00",
        "transactionType": "PAYMENT_RECEIVED",
        "amount": 15000.0,
        "description": "Payment Received - PAY-001",
        "reference": "PAY-001",
        "isReversed": false,
        "entityType": "CUSTOMER",
        "entityName": "John Doe",
        "entityId": "cust-1111-2222-3333-444444444444",
        "debitAccountName": "Cash",
        "creditAccountName": "Accounts Receivable",
        "debitAmount": null,
        "creditAmount": 15000.0,
        "runningBalance": 30000.0
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

---

## Accounting Flow Summary

### Purchase Order Lifecycle (Accounting Entries)

| Event | Debit | Credit | Cash Flow |
|-------|-------|--------|-----------|
| **PO Approved** | Regular Expenses +$27,500 | Accounts Payable +$27,500 | None (accrual) |
| **Payment Made** | Accounts Payable -$10,000 | Cash -$10,000 | PAYMENT_MADE $10,000 |
| **Payment Deleted** | Cash +$10,000 (reversal) | Accounts Payable +$10,000 (reversal) | REFUND_RECEIVED $10,000 |
| **PO Cancelled** | Accounts Payable -$27,500 (reversal) | Regular Expenses -$27,500 (reversal) | None |

### Invoice Lifecycle (Existing - for reference)

| Event | Debit | Credit | Cash Flow |
|-------|-------|--------|-----------|
| **Sale (Invoice PAID)** | Accounts Receivable +$15,000 | Sales Revenue +$15,000 | None (accrual) |
| **Payment Received** | Cash +$15,000 | Accounts Receivable -$15,000 | PAYMENT_RECEIVED $15,000 |
| **Payment Deleted** | Accounts Receivable +$15,000 (reversal) | Cash -$15,000 (reversal) | REFUND_GIVEN $15,000 |