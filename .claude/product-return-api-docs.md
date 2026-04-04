# Product Return API Documentation

## Base URL

`/product-return/v1`

**Module:** `INVOICE_MANAGEMENT`

---

## Overview

Product returns follow a **header + line items** pattern with an **approval workflow**:

1. **Create DRAFT** — header only (no side-effects)
2. **Add items** — add line items to the draft (no side-effects)
3. **Approve** — triggers stock updates, accounting entries, and balance changes
4. **Delete** — DRAFT: just deletes; APPROVED: reverses all side-effects

---

## Endpoints

### 1. Create Draft Return

**POST** `/{organizationId}/{customerId}`

Creates a DRAFT product return header with no line items. No stock, accounting, or balance changes occur.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `customerId` | UUID | Customer ID |

**Request Body:**

```json
{
  "reason": "Defective products",
  "refundType": "CREDIT_TO_BALANCE",
  "taxPercent": 5.0,
  "vatPercent": 15.0
}
```

| Field        | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| `reason`     | String | No       | Reason for the return                |
| `refundType` | Enum   | Yes      | `CREDIT_TO_BALANCE` or `CASH_REFUND` |
| `taxPercent` | Double | No       | Tax rate % (defaults to 0.0)         |
| `vatPercent` | Double | No       | VAT rate % (defaults to 0.0)         |

**Validation:**

- Customer must belong to the organization
- `CREDIT_TO_BALANCE` only allowed when `paymentOnInvoice = false`

---

### 2. Add Item to Draft

**POST** `/{organizationId}/{returnId}/add-item`

Adds a line item to a DRAFT return. Price and discount are derived from the product's stock batch.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `returnId` | UUID | Product return ID |

**Request Body:**

```json
{
  "productCode": "PRD-001",
  "quantityReturned": 5,
  "pricePerUnit": 100.0,
  "discountPercent": 10.0,
  "productCondition": "RESTORABLE"
}
```

| Field              | Type    | Required | Description                                                           |
| ------------------ | ------- | -------- | --------------------------------------------------------------------- |
| `productCode`      | String  | Yes      | Product code — system finds first stock batch with available quantity |
| `quantityReturned` | Integer | Yes      | Number of units returned (min: 1)                                     |
| `pricePerUnit`     | Double  | Yes      | Price per unit for the returned product                               |
| `discountPercent`  | Double  | No       | Discount percentage (defaults to 0.0)                                 |
| `productCondition` | Enum    | Yes      | `RESTORABLE` or `BROKEN`                                              |

**Validation:**

- Return must be in DRAFT status
- Product must exist with the given code in the organization
- Product must have at least one stock batch with available quantity
- `quantityReturned` must be > 0

---

### 3. Remove Item from Draft

**DELETE** `/{organizationId}/{returnId}/remove-item/{itemId}`

Removes a line item from a DRAFT return.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `returnId` | UUID | Product return ID |
| `itemId` | UUID | Return item ID |

**Validation:**

- Return must be in DRAFT status
- Item must exist on the return

---

### 4. Approve Return

**PUT** `/{organizationId}/{returnId}/approve`

Approves a DRAFT return, triggering all side-effects: stock updates, accounting entries, and balance changes.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `returnId` | UUID | Product return ID |

**Validation:**

- Return must be in DRAFT status
- Return must have at least one item

**Side-effects on approval:**

- Stock updated per item (see Product Condition section)
- Accounting entries recorded
- Customer balance updated (if CREDIT_TO_BALANCE)
- `refundAmount` calculated as totalAmount (subTotal + tax + vat)

---

### 5. Delete Return

**DELETE** `/{organizationId}/{returnId}?reason=xxx`

Deletes a product return. If DRAFT, simply soft-deletes. If APPROVED, reverses all side-effects first.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `returnId` | UUID | Product return ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `reason` | String | No | "Product Return Cancelled" | Reason for deletion |

**Validation:**

- Return must not already be deleted
- For APPROVED returns: available stock must be >= quantity being reversed (for RESTORABLE items)

---

### 6. Get Returns by Customer (Paginated)

**GET** `/{organizationId}/{customerId}/returns?page=0&size=10`

Returns paginated list of non-deleted product returns for a specific customer.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `organizationId` | UUID | Organization ID |
| `customerId` | UUID | Customer ID |

---

### 7. Get All Returns by Organization (Paginated)

**GET** `/{organizationId}?page=0&size=10`

Returns paginated list of all non-deleted product returns for an organization.

---

## Response Format

**ReturnResponse:**

```json
{
  "id": "uuid",
  "returnNumber": "RET-A1B2C3D4",
  "returnDate": "2026-04-01",
  "reason": "Defective products",
  "refundType": "CASH_REFUND",
  "taxPercent": 5.0,
  "vatPercent": 15.0,
  "subTotal": 900.0,
  "taxAmount": 45.0,
  "vatAmount": 135.0,
  "refundAmount": 1080.0,
  "status": "DRAFT",
  "customerName": "John Doe",
  "items": [
    {
      "id": "uuid",
      "quantityReturned": 5,
      "pricePerUnit": 100.0,
      "discountPercent": 10.0,
      "productCondition": "RESTORABLE",
      "lineSubtotal": 500.0,
      "discountAmount": 50.0,
      "lineTotal": 450.0,
      "productCode": "PRD-001",
      "productName": "Widget A",
      "batchNumber": "BATCH-001"
    },
    {
      "id": "uuid",
      "quantityReturned": 3,
      "pricePerUnit": 200.0,
      "discountPercent": 5.0,
      "productCondition": "BROKEN",
      "lineSubtotal": 600.0,
      "discountAmount": 30.0,
      "lineTotal": 570.0,
      "productCode": "PRD-002",
      "productName": "Widget B",
      "batchNumber": "BATCH-002"
    }
  ]
}
```

---

## Accounting Entries (on Approval)

### Revenue Reversal (always created):

| #   | Debit                 | Credit                     | Amount     | Purpose              |
| --- | --------------------- | -------------------------- | ---------- | -------------------- |
| 1   | SALES_RETURNS (41010) | A/R* or CUSTOMER_DEPOSITS* | subTotal   | Reverse revenue      |
| 2   | TAX_PAYABLE (23000)   | A/R* or CUSTOMER_DEPOSITS* | tax amount | Reverse tax (if > 0) |
| 3   | VAT_OUTPUT (23010)    | A/R* or CUSTOMER_DEPOSITS* | vat amount | Reverse VAT (if > 0) |

\*Credit account depends on `paymentOnInvoice`:

- `true` (invoice-level) → ACCOUNTS_RECEIVABLE (12000)
- `false` (customer-level) → CUSTOMER_DEPOSITS (23040)

### Cash Refund (only for `CASH_REFUND` type):

| #   | Debit                    | Credit       | Amount       | Purpose        |
| --- | ------------------------ | ------------ | ------------ | -------------- |
| 4   | A/R or CUSTOMER_DEPOSITS | CASH (11000) | refundAmount | Cash going out |

Also records a cash flow entry: `REFUND_GIVEN`, `OPERATING` category.

### Credit to Balance (only for `CREDIT_TO_BALANCE` type):

- `customer.balance += refundAmount`

---

## On Deletion of APPROVED Return

- All transactions linked to the return are reversed using the standard reversal pattern
- Stock reversed per item condition:
  - `RESTORABLE`: `restorableReturn -= qty`, `availableQuantity -= qty`
  - `BROKEN`: `brokenReturn -= qty`
- If `CREDIT_TO_BALANCE`: `customer.balance -= refundAmount`
- If original had cash refund entries: cash flow reversal recorded as `REFUND_RECEIVED`

---

## Statuses

| Status     | Description                                                      |
| ---------- | ---------------------------------------------------------------- |
| `DRAFT`    | Return created, items can be added/removed, no side-effects yet  |
| `APPROVED` | Return approved, stock/accounting/balance updated                |
| `DELETED`  | Return has been soft-deleted (reversals applied if was APPROVED) |

---

## Product Condition (per line item)

| Condition    | Description                                  | availableQuantity     | restorableReturn / brokenReturn |
| ------------ | -------------------------------------------- | --------------------- | ------------------------------- |
| `RESTORABLE` | Product in good condition, returned to stock | `+= quantityReturned` | `restorableReturn += qty`       |
| `BROKEN`     | Product damaged, cannot be restocked         | No change             | `brokenReturn += qty`           |

Each item in a return can have a different condition.

---

## Refund Types (per header)

| Type                | Description                                 | Payment Mode                                   | Effect                     |
| ------------------- | ------------------------------------------- | ---------------------------------------------- | -------------------------- |
| `CREDIT_TO_BALANCE` | Credit refund to customer's deposit balance | Customer-level only (`paymentOnInvoice=false`) | Increases customer balance |
| `CASH_REFUND`       | Cash refund paid to customer                | Both modes                                     | Decreases cash account     |
