# Dual Payment Mode — API Changes

**Base URL:** `http://localhost:{port}/tallyapp`
**Auth:** Bearer JWT token (all endpoints require authentication)

---

## Overview

TallyApp supports two payment modes, toggled per organization via the immutable `paymentOnInvoice` field:

| Mode | `paymentOnInvoice` | Endpoint Base | Description |
|------|--------------------|---------------|-------------|
| **Invoice-level** | `true` (default) | `/payment/v1` | Payments recorded per invoice. Customer-level endpoints are disabled. |
| **Customer-level** | `false` | `/customer-payment/v1` | Payments recorded against customer balance. Invoice-level endpoints are disabled. |

Calling a disabled endpoint returns: `"Invoice-level payments are disabled. Use customer-level payments instead."` (or vice versa).

---

## 1. Organization — New Field

**Base path:** `/organization/v1`

### POST `/add` — Create Organization

**Request:**
```json
{
  "orgName": "Acme Corp",
  "orgRegNumber": "REG-12345",
  "orgTinNumber": "TIN-67890",
  "orgVatNumber": "VAT-11111",
  "orgMobileNo": "01712345678",
  "orgEmail": "info@acme.com",
  "owner": "John Doe",
  "tax": 5.0,
  "vat": 15.0,
  "paymentOnInvoice": true,
  "since": "2020-01-15",
  "orgAddressLine": "123 Main Street",
  "orgAddressCity": "Dhaka",
  "orgAddressPostcode": "1205",
  "orgAddressCountry": "Bangladesh",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "id": "a1b2c3d4-...",
  "orgName": "Acme Corp",
  "orgRegNumber": "REG-12345",
  "orgTinNumber": "TIN-67890",
  "orgVatNumber": "VAT-11111",
  "orgMobileNo": "01712345678",
  "orgEmail": "info@acme.com",
  "owner": "John Doe",
  "tax": 5.0,
  "vat": 15.0,
  "paymentOnInvoice": true,
  "since": "2020-01-15",
  "orgAddressLine": "123 Main Street",
  "orgAddressCity": "Dhaka",
  "orgAddressPostcode": "1205",
  "orgAddressCountry": "Bangladesh",
  "status": "ACTIVE",
  "totalEmployees": 0,
  "totalProducts": 0,
  "totalOwners": 0
}
```

**Notes:**
- `paymentOnInvoice` — **Immutable after creation.** Defaults to `true`. Determines the payment mode for the organization:
  - `true` → **Invoice-level payments:** Payments are recorded per invoice via `/payment/v1`. Customer-level payment endpoints are disabled.
  - `false` → **Customer-level payments:** Payments are recorded against customer balance via `/customer-payment/v1`. Invoice-level payment endpoints are disabled.
- Sending `paymentOnInvoice` in an update request is ignored — the value set at creation is permanent.

---

## 2. Invoice-level Payment (`paymentOnInvoice = true`)

**Base path:** `/payment/v1`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/{invoiceId}/add` | Add payment to invoice |
| DELETE | `/{invoiceId}/{paymentId}` | Delete payment — `reason` ("Customer Dispute") |

### POST `/{invoiceId}/add` — Add Payment

**Request:**
```json
{
  "paymentDate": "2026-03-17",
  "paymentMethod": "CASH",
  "paymentRef": "PAY-001",
  "paymentAmount": 5000.0
}
```

**Response:**
```json
{
  "id": "x1y2z3-...",
  "paymentDate": "2026-03-17",
  "paymentMethod": "CASH",
  "reference": "PAY-001",
  "amount": 5000.0,
  "status": "COMPLETED"
}
```

**Validation:**
- Organization must have `paymentOnInvoice = true`
- Invoice must have a customer
- Payment amount must be > 0 and <= remaining amount
- Invoice must not already be PAID

**Accounting:** Dr Cash (11000) | Cr Accounts Receivable (12000)

### DELETE `/{invoiceId}/{paymentId}?reason=Duplicate` — Delete Payment

**Response:**
```json
{
  "sucs": true,
  "message": "Payment deleted successfully"
}
```

**Validation:**
- Organization must have `paymentOnInvoice = true`
- Cannot delete payments on PAID invoices

**Accounting:** Reverses the original Dr Cash / Cr A/R entry.

### Invoice PAID Flow (Invoice-level)

To mark an invoice as PAID, set `invoiceStatus: "PAID"` in `PUT /invoice/v1/{invoiceId}`. The system validates:
1. Invoice must have payments covering the full total (`isFullyPaid()`)
2. Cannot change PAID/PARTIALLY_PAID invoices back to DRAFT/ISSUED when payments exist

**Accounting (on PAID):** Dr Accounts Receivable (12000) | Cr Sales Revenue (41000) + Tax Payable + VAT Output

---

## 3. Customer-level Payment (`paymentOnInvoice = false`)

**Base path:** `/customer-payment/v1`

Payments are made at the **customer level** (not per-invoice). Customers maintain a balance via deposits, and invoices are marked paid by deducting from that balance.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/{organizationId}/{customerId}/receive` | Receive payment from customer |
| DELETE | `/{organizationId}/{paymentId}` | Delete customer payment — `reason` ("Customer Dispute") |
| GET | `/{organizationId}/{customerId}/history` | Get payment history — `page` (0), `size` (10) |

### POST `/{organizationId}/{customerId}/receive` — Receive Payment

**Request:**
```json
{
  "amount": 20000.0,
  "paymentDate": "2026-03-17",
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TXN-98765",
  "notes": "Advance payment for March orders"
}
```

**Response:**
```json
{
  "id": "p1q2r3s4-...",
  "amount": 20000.0,
  "paymentDate": "2026-03-17",
  "paymentMethod": "BANK_TRANSFER",
  "reference": "TXN-98765",
  "notes": "Advance payment for March orders",
  "status": "COMPLETED"
}
```

**Validation:**
- Organization must have `paymentOnInvoice = false`

**Accounting:** Dr Cash (11000) | Cr Customer Deposits (23040)
**Effect:** Customer balance increases by payment amount.

### DELETE `/{organizationId}/{paymentId}?reason=Duplicate` — Delete Payment

**Response:**
```json
{
  "sucs": true,
  "message": "Payment deleted successfully"
}
```

**Validation:**
- Organization must have `paymentOnInvoice = false`
- Deletion is rejected if it would leave paid invoices unbacked (i.e. customer balance after deletion would go negative while PAID invoices exist)

**Accounting:** Reverses the original Dr Cash / Cr Customer Deposits entry.

### GET `/{organizationId}/{customerId}/history` — Payment History

**Response:**
```json
{
  "content": [
    {
      "id": "p1q2r3s4-...",
      "amount": 20000.0,
      "paymentDate": "2026-03-17",
      "paymentMethod": "BANK_TRANSFER",
      "reference": "TXN-98765",
      "notes": "Advance payment for March orders",
      "status": "COMPLETED"
    }
  ],
  "number": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

### Invoice PAID Flow (Customer-level)

To mark an invoice as PAID, set `invoiceStatus: "PAID"` in `PUT /invoice/v1/{invoiceId}`. The system validates:
1. Invoice must have a customer
2. Customer's `balance` must be >= invoice total amount
3. If sufficient: customer balance is deducted, and sale accounting entries are recorded

**Note:** A negative balance represents opening due. Customer must deposit enough to cover the due + invoice amount before marking invoices as paid.

**Accounting (on PAID):** Dr Customer Deposits (23040) | Cr Sales Revenue (41000) + Tax Payable + VAT Output

---

## 4. Customer Detail — Conditional Response

**Base path:** `/customer/v1`

### GET `/{organizationId}/{customerId}/detail` — Get Customer Detail

Response fields are conditional based on the organization's `paymentOnInvoice` setting.

**Response (when `paymentOnInvoice = true` — invoice-level):**
```json
{
  "id": "c1d2e3f4-...",
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "mobile": "01711223344",
  "address": "45 Gulshan Avenue, Dhaka",
  "postcode": "1212",
  "totalInvoice": 2,
  "paidInvoiceCount": 1,
  "unpaidInvoiceCount": 1,
  "totalAmount": 10000.0,
  "totalDueAmount": 5000.0,
  "totalPaidAmount": 5000.0,
  "balance": 0.0,
  "customerPayments": null,
  "invoices": [
    {
      "id": "a1b2c3d4-...",
      "invoiceNumber": "INV-0001",
      "invoiceDate": "2026-03-17",
      "invoiceStatus": "PAID",
      "totalAmount": 5000.0,
      "totalPaid": 5000.0,
      "remainingAmount": 0.0,
      "payments": [
        {
          "id": "x1y2z3-...",
          "amount": 5000.0,
          "paymentDate": "2026-03-17",
          "paymentMethod": "CASH",
          "reference": "PAY-001"
        }
      ]
    }
  ]
}
```

**Response (when `paymentOnInvoice = false` — customer-level):**
```json
{
  "id": "c1d2e3f4-...",
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "mobile": "01711223344",
  "address": "45 Gulshan Avenue, Dhaka",
  "postcode": "1212",
  "totalInvoice": 2,
  "paidInvoiceCount": 1,
  "unpaidInvoiceCount": 1,
  "totalAmount": 10000.0,
  "totalDueAmount": 5000.0,
  "totalPaidAmount": 5000.0,
  "balance": 15000.0,
  "customerPayments": [
    {
      "id": "p1q2r3s4-...",
      "amount": 15000.0,
      "paymentDate": "2026-03-17",
      "paymentMethod": "BANK_TRANSFER",
      "reference": "TXN-98765",
      "notes": "Advance payment",
      "status": "COMPLETED"
    }
  ],
  "invoices": [
    {
      "id": "a1b2c3d4-...",
      "invoiceNumber": "INV-0001",
      "invoiceDate": "2026-03-17",
      "invoiceStatus": "PAID",
      "totalAmount": 5000.0
    }
  ]
}
```

**Field differences by mode:**

| Field | `paymentOnInvoice = true` | `paymentOnInvoice = false` |
|-------|---------------------------|----------------------------|
| `customerPayments` | `null` | Populated from CustomerPaymentEntity |
| `invoices[].totalPaid` | Per-invoice paid amount | `null` |
| `invoices[].remainingAmount` | Per-invoice remaining | `null` |
| `invoices[].payments` | Invoice-level PaymentEntity list | `null` |

---

## 5. Invoice PDF — Conditional Sections

**Endpoint:** `GET /invoice/v1/{organizationId}/{invoiceId}/pdf/download`

| Section | `paymentOnInvoice = true` | `paymentOnInvoice = false` |
|---------|---------------------------|----------------------------|
| Payment History table | Shown (left side of bottom layout) | Hidden |
| Summary: Total Paid row | Shown | Hidden |
| Summary: Total Due row | Shown | Hidden |
| Bottom layout | 67/33 split (payments + summary) | 60/40 split (empty + summary) |

---

## 6. Customer PDF — Conditional Sections

**Endpoint:** `GET /customer/v1/{organizationId}/{customerId}/pdf/download`

| Section | `paymentOnInvoice = true` | `paymentOnInvoice = false` |
|---------|---------------------------|----------------------------|
| Account Summary | Total Invoices / Amount / Paid / Due | Total Invoices / Amount / Balance |
| Invoice Table columns | SL, Invoice#, Date, Amount, **Paid**, **Due**, Status | SL, Invoice#, Date, Amount, Status |
| Payment History source | Invoice-level payments (grouped by invoice) | Customer-level payments (CustomerPaymentEntity) |
| Footer | Total Amount / Total Paid / Total Due | Total Amount / Customer Balance |

---

## Accounting Summary

| Event | `paymentOnInvoice = true` | `paymentOnInvoice = false` |
|-------|---------------------------|----------------------------|
| **Sale (invoice marked PAID)** | Dr Accounts Receivable (12000) / Cr Revenue + Tax + VAT | Dr Customer Deposits (23040) / Cr Revenue + Tax + VAT |
| **Payment received** | Dr Cash (11000) / Cr A/R (12000) — per invoice | Dr Cash (11000) / Cr Customer Deposits (23040) — per customer |
| **Payment deleted** | Reverse Dr Cash / Cr A/R | Reverse Dr Cash / Cr Customer Deposits |