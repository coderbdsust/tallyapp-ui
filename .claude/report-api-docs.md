# Report API Documentation

Base URL: `/reports/v1`
Required Module: `REPORTING`

---

## 1. Profit and Loss

**GET** `/{organizationId}/profit-and-loss?startDate={date}&endDate={date}`

### Parameters

| Name             | In    | Type   | Required | Format       | Description              |
|------------------|-------|--------|----------|--------------|--------------------------|
| organizationId   | path  | UUID   | Yes      |              | Organization identifier  |
| startDate        | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate          | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

### Response `200 OK`

```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "organizationName": "Acme Corp",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "revenueItems": [
    {
      "accountCode": 41000,
      "accountName": "Sales Revenue",
      "amount": 50000.00
    },
    {
      "accountCode": 42000,
      "accountName": "Service Revenue",
      "amount": 12000.00
    }
  ],
  "totalRevenue": 62000.00,
  "expenseItems": [
    {
      "accountCode": 50000,
      "accountName": "Regular Expenses",
      "amount": 20000.00
    },
    {
      "accountCode": 51030,
      "accountName": "Employee Salary",
      "amount": 15000.00
    }
  ],
  "totalExpenses": 35000.00,
  "netIncome": 27000.00
}
```

### Field Descriptions

| Field          | Type   | Description                                          |
|----------------|--------|------------------------------------------------------|
| revenueItems   | array  | Revenue accounts with net activity (credits - debits)|
| totalRevenue   | number | Sum of all revenue line items                        |
| expenseItems   | array  | Expense accounts with net activity (debits - credits)|
| totalExpenses  | number | Sum of all expense line items                        |
| netIncome      | number | `totalRevenue - totalExpenses`                       |

---

## 2. Trial Balance

**GET** `/{organizationId}/trial-balance?startDate={date}&endDate={date}`

### Parameters

| Name             | In    | Type   | Required | Format       | Description              |
|------------------|-------|--------|----------|--------------|--------------------------|
| organizationId   | path  | UUID   | Yes      |              | Organization identifier  |
| startDate        | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate          | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

### Response `200 OK`

```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "organizationName": "Acme Corp",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "accounts": [
    {
      "accountCode": 11000,
      "accountName": "Cash",
      "accountType": "ASSET",
      "totalDebit": 80000.00,
      "totalCredit": 45000.00,
      "balance": 35000.00
    },
    {
      "accountCode": 12000,
      "accountName": "Accounts Receivable",
      "accountType": "ASSET",
      "totalDebit": 50000.00,
      "totalCredit": 30000.00,
      "balance": 20000.00
    },
    {
      "accountCode": 21000,
      "accountName": "Accounts Payable",
      "accountType": "LIABILITY",
      "totalDebit": 10000.00,
      "totalCredit": 25000.00,
      "balance": 15000.00
    },
    {
      "accountCode": 23000,
      "accountName": "Tax Payable",
      "accountType": "LIABILITY",
      "totalDebit": 0.00,
      "totalCredit": 5000.00,
      "balance": 5000.00
    },
    {
      "accountCode": 41000,
      "accountName": "Sales Revenue",
      "accountType": "REVENUE",
      "totalDebit": 0.00,
      "totalCredit": 50000.00,
      "balance": 50000.00
    }
  ],
  "totalDebits": 140000.00,
  "totalCredits": 140000.00
}
```

### Field Descriptions

| Field        | Type   | Description                                                    |
|--------------|--------|----------------------------------------------------------------|
| accounts     | array  | All active accounts with period debits, credits, and balance   |
| totalDebit   | number | Sum of all debit entries to this account in the period         |
| totalCredit  | number | Sum of all credit entries to this account in the period        |
| balance      | number | Current running balance of the account                         |
| totalDebits  | number | Grand total of all debit activity (should equal totalCredits)  |
| totalCredits | number | Grand total of all credit activity (should equal totalDebits)  |

---

## 3. Tax / VAT Report

**GET** `/{organizationId}/tax-vat?startDate={date}&endDate={date}`

### Parameters

| Name             | In    | Type   | Required | Format       | Description              |
|------------------|-------|--------|----------|--------------|--------------------------|
| organizationId   | path  | UUID   | Yes      |              | Organization identifier  |
| startDate        | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate          | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

### Response `200 OK`

```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "organizationName": "Acme Corp",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "entries": [
    {
      "month": "2026-01",
      "accountCode": 23000,
      "accountName": "Tax Payable",
      "totalDebit": 0.00,
      "totalCredit": 2500.00,
      "netMovement": 2500.00
    },
    {
      "month": "2026-01",
      "accountCode": 23010,
      "accountName": "VAT Output",
      "totalDebit": 0.00,
      "totalCredit": 3000.00,
      "netMovement": 3000.00
    },
    {
      "month": "2026-01",
      "accountCode": 50010,
      "accountName": "VAT Input (Recoverable)",
      "totalDebit": 1200.00,
      "totalCredit": 0.00,
      "netMovement": -1200.00
    },
    {
      "month": "2026-02",
      "accountCode": 23000,
      "accountName": "Tax Payable",
      "totalDebit": 0.00,
      "totalCredit": 1800.00,
      "netMovement": 1800.00
    }
  ],
  "totalTaxCollected": 4300.00,
  "totalVatOutput": 5500.00,
  "totalVatInput": 2100.00,
  "netVatPayable": 3400.00
}
```

### Field Descriptions

| Field             | Type   | Description                                                      |
|-------------------|--------|------------------------------------------------------------------|
| entries           | array  | Monthly breakdown per tax/VAT account                            |
| month             | string | Period in `YYYY-MM` format                                       |
| totalDebit        | number | Debits to the account in the month (payments/settlements)        |
| totalCredit       | number | Credits to the account in the month (new liabilities from sales) |
| netMovement       | number | `totalCredit - totalDebit` (positive = liability increased)      |
| totalTaxCollected | number | Current balance of Tax Payable (account 23000)                   |
| totalVatOutput    | number | Current balance of VAT Output (account 23010)                    |
| totalVatInput     | number | Current balance of VAT Input/Recoverable (account 50010)         |
| netVatPayable     | number | `totalVatOutput - totalVatInput`                                 |

### Tracked Accounts

| Code  | Name                   | Type      | Description                          |
|-------|------------------------|-----------|--------------------------------------|
| 23000 | Tax Payable            | LIABILITY | Tax collected on sales               |
| 23010 | VAT Output             | LIABILITY | VAT collected on sales               |
| 23030 | WHT Payable            | LIABILITY | Withholding tax payable              |
| 50010 | VAT Input (Recoverable)| ASSET     | VAT paid on purchases (reclaimable)  |

---

## 4. Accounts Receivable Aging

**GET** `/{organizationId}/ar-aging`

### Parameters

| Name             | In   | Type | Required | Description             |
|------------------|------|------|----------|-------------------------|
| organizationId   | path | UUID | Yes      | Organization identifier |

### Response `200 OK`

```json
{
  "organizationId": "550e8400-e29b-41d4-a716-446655440000",
  "organizationName": "Acme Corp",
  "reportDate": "2026-03-14",
  "buckets": [
    {
      "bucket": "CURRENT",
      "invoiceCount": 5,
      "totalOutstanding": 12000.00
    },
    {
      "bucket": "1_30_DAYS",
      "invoiceCount": 3,
      "totalOutstanding": 8500.00
    },
    {
      "bucket": "31_60_DAYS",
      "invoiceCount": 2,
      "totalOutstanding": 4200.00
    },
    {
      "bucket": "61_90_DAYS",
      "invoiceCount": 1,
      "totalOutstanding": 3000.00
    },
    {
      "bucket": "OVER_90_DAYS",
      "invoiceCount": 1,
      "totalOutstanding": 1500.00
    }
  ],
  "totalOutstanding": 29200.00
}
```

### Field Descriptions

| Field            | Type   | Description                                           |
|------------------|--------|-------------------------------------------------------|
| reportDate       | string | Date the report was generated                         |
| buckets          | array  | Aging buckets based on delivery date vs current date  |
| bucket           | string | One of: `CURRENT`, `1_30_DAYS`, `31_60_DAYS`, `61_90_DAYS`, `OVER_90_DAYS` |
| invoiceCount     | number | Number of invoices in the bucket                      |
| totalOutstanding | number | Total unpaid amount (invoice total - payments made)   |

### Bucket Definitions

| Bucket        | Criteria                                        |
|---------------|-------------------------------------------------|
| CURRENT       | Delivery date is today or in the future         |
| 1_30_DAYS     | 1 to 30 days past delivery date                 |
| 31_60_DAYS    | 31 to 60 days past delivery date                |
| 61_90_DAYS    | 61 to 90 days past delivery date                |
| OVER_90_DAYS  | More than 90 days past delivery date            |

Only invoices with status `ISSUED` or `PARTIALLY_PAID` are included.

---

## PDF Download Endpoints

Base URL: `/pdf/v1/report`
Required Module: `REPORTING`

Each endpoint returns a downloadable PDF file with `Content-Type: application/pdf` and `Content-Disposition: attachment`.

---

### 5. Profit and Loss PDF

**GET** `/pdf/v1/report/{orgId}/profit-and-loss/download?startDate={date}&endDate={date}`

| Name      | In    | Type   | Required | Format       | Description              |
|-----------|-------|--------|----------|--------------|--------------------------|
| orgId     | path  | UUID   | Yes      |              | Organization identifier  |
| startDate | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate   | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

**Response:** `200 OK` — `application/pdf` binary, filename: `profit-and-loss-{orgId}.pdf`

PDF contains: title, organization/period header, revenue table (code, account, amount), expense table, and net income/loss summary.

---

### 6. Trial Balance PDF

**GET** `/pdf/v1/report/{orgId}/trial-balance/download?startDate={date}&endDate={date}`

| Name      | In    | Type   | Required | Format       | Description              |
|-----------|-------|--------|----------|--------------|--------------------------|
| orgId     | path  | UUID   | Yes      |              | Organization identifier  |
| startDate | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate   | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

**Response:** `200 OK` — `application/pdf` binary, filename: `trial-balance-{orgId}.pdf`

PDF contains: title, organization/period header, accounts table (code, account, type, debit, credit, balance), and totals row.

---

### 7. Tax & VAT Report PDF

**GET** `/pdf/v1/report/{orgId}/tax-vat/download?startDate={date}&endDate={date}`

| Name      | In    | Type   | Required | Format       | Description              |
|-----------|-------|--------|----------|--------------|--------------------------|
| orgId     | path  | UUID   | Yes      |              | Organization identifier  |
| startDate | query | string | Yes      | `YYYY-MM-DD` | Report period start date |
| endDate   | query | string | Yes      | `YYYY-MM-DD` | Report period end date   |

**Response:** `200 OK` — `application/pdf` binary, filename: `tax-vat-report-{orgId}.pdf`

PDF contains: title, organization/period header, monthly tax/VAT movements table (month, code, account, debit, credit, net movement), and summary totals (tax collected, VAT output, VAT input, net VAT payable).

---

### 8. AR Aging Report PDF

**GET** `/pdf/v1/report/{orgId}/ar-aging/download`

| Name  | In   | Type | Required | Description             |
|-------|------|------|----------|-------------------------|
| orgId | path | UUID | Yes      | Organization identifier |

**Response:** `200 OK` — `application/pdf` binary, filename: `ar-aging-report-{orgId}.pdf`

PDF contains: title, organization/report date header, aging buckets table (bucket, invoice count, outstanding amount), and total outstanding.

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "sucs": false,
  "message": "Organization not found: <id>",
  "businessCode": 400
}
```

| Status | Condition                          |
|--------|------------------------------------|
| 400    | Invalid parameters or missing data |
| 403    | Missing REPORTING module access    |
| 404    | Organization not found             |
