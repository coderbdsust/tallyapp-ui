# Customer API Documentation

## Base URL

`/customer/v1`

## Payment Modes

- **Invoice-level** (`paymentOnInvoice=true`): Payments are recorded per invoice via `/payment/v1`. Customer `openingDue` is ignored.
- **Customer-level** (`paymentOnInvoice=false`): Payments are recorded at the customer level via `/customer-payment/v1`. Customer maintains `balance`, `openingDue`, and `effectiveBalance = balance - openingDue`.

---

## Endpoints

### POST `/{organizationId}` — Create Customer

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "01712345678",
  "billingAddressLine": "123 Main Street",
  "billingCity": "Dhaka",
  "billingPostcode": "1205",
  "billingCountry": "Bangladesh",
  "deliveryAddressLine": "456 Delivery Lane",
  "deliveryCity": "Chittagong",
  "deliveryPostcode": "4000",
  "deliveryCountry": "Bangladesh",
  "openingDue": 5000.0
}
```

**Notes:**

- `name` and `mobile` are required.
- `openingDue` is only processed when `paymentOnInvoice=false`. Creates an accounting entry: Dr A/R (12000) | Cr Opening Balance Equity (31500).
- All address fields are optional.

**Response:** `CustomerResponse` (see below)

---

### PUT `/{organizationId}/{customerId}` — Edit Customer

**Request Body:** Same as Create Customer.

**Notes:**

- If `openingDue` changes (and `paymentOnInvoice=false`), a correcting accounting entry is created for the difference.

**Response:** `CustomerResponse`

---

### GET `/{organizationId}/{customerId}` — Get Customer

**Response:** `CustomerResponse`

---

### GET `/{organizationId}/{customerId}/detail` — Get Customer Detail

**Response:** `CustomerDetailResponse`

---

### GET `/{organizationId}` — List Customers (Paginated)

**Query Parameters:**
| Param | Default | Description |
|----------|---------|------------------------------------------|
| `search` | `""` | Search by name, mobile, or email (min 3 chars) |
| `page` | `0` | Page number |
| `size` | `10` | Page size |

**Response:** `PageResponse<CustomerResponse>`

---

## Response Schemas

### CustomerResponse

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "01712345678",
  "billingAddressLine": "123 Main Street",
  "billingCity": "Dhaka",
  "billingPostcode": "1205",
  "billingCountry": "Bangladesh",
  "deliveryAddressLine": "456 Delivery Lane",
  "deliveryCity": "Chittagong",
  "deliveryPostcode": "4000",
  "deliveryCountry": "Bangladesh",
  "totalInvoice": 5,
  "totalAmount": 50000.0,
  "totalDueAmount": 20000.0,
  "totalPaidAmount": 30000.0,
  "balance": 15000.0,
  "openingDue": 5000.0,
  "effectiveBalance": 10000.0
}
```

### CustomerDetailResponse

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "01712345678",
  "billingAddressLine": "123 Main Street",
  "billingCity": "Dhaka",
  "billingPostcode": "1205",
  "billingCountry": "Bangladesh",
  "deliveryAddressLine": "456 Delivery Lane",
  "deliveryCity": "Chittagong",
  "deliveryPostcode": "4000",
  "deliveryCountry": "Bangladesh",
  "totalInvoice": 5,
  "paidInvoiceCount": 3,
  "unpaidInvoiceCount": 2,
  "totalAmount": 50000.0,
  "totalDueAmount": 18000.0,
  "totalPaidAmount": 30000.0,
  "totalReturnAmount": 2000.0,
  "balance": 15000.0,
  "openingDue": 5000.0,
  "effectiveBalance": 10000.0,
  "customerPayments": [
    {
      "id": "uuid",
      "amount": 10000.0,
      "paymentDate": "2026-03-25",
      "paymentMethod": "BANK_TRANSFER",
      "reference": "TXN-001",
      "notes": "March payment",
      "status": "COMPLETED"
    }
  ],
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-00012",
      "invoiceDate": "2026-03-20",
      "invoiceStatus": "PAID",
      "totalAmount": 10000.0,
      "totalPaid": 10000.0,
      "remainingAmount": 0.0,
      "payments": []
    }
  ],
  "saleReturns": [
    {
      "id": "uuid",
      "returnNumber": "RET-A1B2C3D4",
      "returnDate": "2026-04-01",
      "reason": "Defective product",
      "refundType": "CASH_REFUND",
      "refundAmount": 2000.0,
      "status": "APPROVED",
      "itemCount": 3
    }
  ]
}
```

**Notes:**

- `customerPayments` is only populated when `paymentOnInvoice=false`.
- `invoices[].totalPaid`, `remainingAmount`, and `payments` are only populated when `paymentOnInvoice=true`.
- `saleReturns` lists only APPROVED, non-deleted returns.
- `totalDueAmount = totalAmount - totalPaid - totalReturnAmount + openingDue` (openingDue added only in customer-level mode).
- `totalReturnAmount` is the sum of all approved sale return refund amounts.

---

## Customer Payment Endpoints

### Base URL: `/customer-payment/v1`

These endpoints are only available when `paymentOnInvoice=false`.

### POST `/{organizationId}/{customerId}/receive` — Receive Payment

**Request Body:**

```json
{
  "amount": 10000.0,
  "paymentDate": "2026-03-25",
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TXN-001",
  "notes": "March payment"
}
```

**Accounting:** Dr Cash (11000) | Cr Customer Deposits (23040)

**Response:**

```json
{
  "id": "uuid",
  "amount": 10000.0,
  "paymentDate": "2026-03-25",
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TXN-001",
  "notes": "March payment",
  "status": "COMPLETED"
}
```

### DELETE `/{organizationId}/{paymentId}` — Delete Payment

**Query Parameters:**
| Param | Default | Description |
|----------|-------------------|--------------------|
| `reason` | `Customer Dispute`| Reason for deletion |

**Validation:** Checks that `effectiveBalance` after deletion would not leave paid invoices unbacked.

**Response:** `ApiResponse { sucs: true, message: "Payment deleted successfully" }`

### GET `/{organizationId}/{customerId}/history` — Payment History (Paginated)

**Query Parameters:**
| Param | Default | Description |
|--------|---------|-------------|
| `page` | `0` | Page number |
| `size` | `10` | Page size |

**Response:** `PageResponse<PaymentResponse>`

---

## Opening Due — Accounting Flow

When `openingDue` is set on a customer (customer-level mode only):

| Scenario             | Debit                                  | Credit                                 | Amount          |
| -------------------- | -------------------------------------- | -------------------------------------- | --------------- |
| New opening due      | A/R (12000, ASSET)                     | Opening Balance Equity (31500, EQUITY) | openingDue      |
| Increase opening due | A/R (12000, ASSET)                     | Opening Balance Equity (31500, EQUITY) | difference      |
| Decrease opening due | Opening Balance Equity (31500, EQUITY) | A/R (12000, ASSET)                     | abs(difference) |

**Effect:** `effectiveBalance = balance - openingDue`. The customer must pay off opening dues before their balance can be used to mark invoices PAID.

---

## Structured Address Fields

Old fields `address` and `postcode` have been replaced with:

| Field                 | Description             |
| --------------------- | ----------------------- |
| `billingAddressLine`  | Billing street address  |
| `billingCity`         | Billing city            |
| `billingPostcode`     | Billing postcode        |
| `billingCountry`      | Billing country         |
| `deliveryAddressLine` | Delivery street address |
| `deliveryCity`        | Delivery city           |
| `deliveryPostcode`    | Delivery postcode       |
| `deliveryCountry`     | Delivery country        |

All fields are optional. PDF generation uses billing address fields.
