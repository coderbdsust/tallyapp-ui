## API Documentation — Implemented Reports

### Cash Flow Statement

#### JSON Endpoint

```
GET /reports/v1/{organizationId}/cash-flow-statement?startDate={date}&endDate={date}
```

**Auth:** Requires `REPORTING` module access.

**Path Parameters:**

| Parameter        | Type | Description                    |
| ---------------- | ---- | ------------------------------ |
| `organizationId` | UUID | Organization unique identifier |

**Query Parameters:**

| Parameter   | Type      | Format       | Required | Description       |
| ----------- | --------- | ------------ | -------- | ----------------- |
| `startDate` | LocalDate | `yyyy-MM-dd` | Yes      | Period start date |
| `endDate`   | LocalDate | `yyyy-MM-dd` | Yes      | Period end date   |

**Response: `200 OK`**

```json
{
  "organizationId": "a1b2c3d4-...",
  "organizationName": "Acme Ltd",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "operatingActivities": [
    {
      "description": "Payment Received",
      "transactionType": "PAYMENT_RECEIVED",
      "inflow": 50000.0,
      "outflow": 0.0,
      "net": 50000.0
    },
    {
      "description": "Payment Made",
      "transactionType": "PAYMENT_MADE",
      "inflow": 0.0,
      "outflow": 30000.0,
      "net": -30000.0
    }
  ],
  "netOperatingCashFlow": 20000.0,
  "investingActivities": [],
  "netInvestingCashFlow": 0.0,
  "financingActivities": [],
  "netFinancingCashFlow": 0.0,
  "netCashChange": 20000.0,
  "openingCashBalance": 15000.0,
  "closingCashBalance": 35000.0
}
```

**Response Fields:**

| Field                  | Type                     | Description                                               |
| ---------------------- | ------------------------ | --------------------------------------------------------- |
| `operatingActivities`  | List\<CashFlowLineItem\> | Operating section line items (includes Reversal category) |
| `netOperatingCashFlow` | Double                   | Sum of operating line item nets                           |
| `investingActivities`  | List\<CashFlowLineItem\> | Investing section line items                              |
| `netInvestingCashFlow` | Double                   | Sum of investing line item nets                           |
| `financingActivities`  | List\<CashFlowLineItem\> | Financing section line items                              |
| `netFinancingCashFlow` | Double                   | Sum of financing line item nets                           |
| `netCashChange`        | Double                   | `netOperating + netInvesting + netFinancing`              |
| `openingCashBalance`   | Double                   | Net of all cash flows before `startDate`                  |
| `closingCashBalance`   | Double                   | `openingCashBalance + netCashChange`                      |

**CashFlowLineItem Fields:**

| Field             | Type   | Description                                                    |
| ----------------- | ------ | -------------------------------------------------------------- |
| `description`     | String | Display name of the transaction type (e.g. "Payment Received") |
| `transactionType` | String | Enum name (e.g. `PAYMENT_RECEIVED`)                            |
| `inflow`          | Double | Total cash inflows for this type in the period                 |
| `outflow`         | Double | Total cash outflows for this type in the period                |
| `net`             | Double | `inflow - outflow`                                             |

**Cash Flow Type Classification:**

| Direction | Transaction Types                                                         |
| --------- | ------------------------------------------------------------------------- |
| Inflow    | `CASH_IN`, `PAYMENT_RECEIVED`, `REFUND_RECEIVED`                          |
| Outflow   | `CASH_OUT`, `PAYMENT_MADE`, `EXPENSE`, `EMPLOYEE_EXPENSE`, `REFUND_GIVEN` |

**Category Mapping:**

| CashFlowEntity.category   | Section                         |
| ------------------------- | ------------------------------- |
| `Operating`               | Operating Activities            |
| `Investing`               | Investing Activities            |
| `Financing`               | Financing Activities            |
| `Reversal` / null / other | Falls into Operating Activities |

#### PDF Download Endpoint

```
GET /pdf/v1/report/{orgId}/cash-flow-statement/download?startDate={date}&endDate={date}
```

**Auth:** Requires `REPORTING` module access.

**Parameters:** Same as JSON endpoint.

**Response: `200 OK`**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=cash-flow-statement-{orgId}.pdf`
- Body: PDF byte stream

**PDF Layout:**

- 3 section tables (Operating, Investing, Financing) with columns: Activity (35%), Inflow (20%), Outflow (20%), Net (25%)
- Empty sections show "No {type} activities" placeholder text
- Summary table with Opening Cash Balance, Net Cash Change, Closing Cash Balance
- Closing balance colored green (positive) or red (negative)

---

### Sales by Customer

#### JSON Endpoint

```
GET /reports/v1/{organizationId}/sales-by-customer?startDate={date}&endDate={date}
```

**Auth:** Requires `REPORTING` module access.

**Path Parameters:**

| Parameter        | Type | Description                    |
| ---------------- | ---- | ------------------------------ |
| `organizationId` | UUID | Organization unique identifier |

**Query Parameters:**

| Parameter   | Type      | Format       | Required | Description       |
| ----------- | --------- | ------------ | -------- | ----------------- |
| `startDate` | LocalDate | `yyyy-MM-dd` | Yes      | Period start date |
| `endDate`   | LocalDate | `yyyy-MM-dd` | Yes      | Period end date   |

**Response: `200 OK`**

```json
{
  "organizationId": "a1b2c3d4-...",
  "organizationName": "Acme Ltd",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "customers": [
    {
      "customerId": "c1d2e3f4-...",
      "customerName": "John Smith",
      "invoiceCount": 15,
      "totalSales": 50000.0,
      "totalTax": 2500.0,
      "totalVat": 3750.0,
      "percentageOfTotal": 45.23
    },
    {
      "customerId": "d4e5f6a7-...",
      "customerName": "ABC Corp",
      "invoiceCount": 8,
      "totalSales": 30000.0,
      "totalTax": 1500.0,
      "totalVat": 2250.0,
      "percentageOfTotal": 27.14
    }
  ],
  "grandTotal": 110500.0
}
```

**Response Fields:**

| Field        | Type                  | Description                                             |
| ------------ | --------------------- | ------------------------------------------------------- |
| `customers`  | List\<CustomerSales\> | Customer sales rows, ordered by `totalSales` descending |
| `grandTotal` | Double                | Sum of all customer `totalSales`                        |

**CustomerSales Fields:**

| Field               | Type   | Description                                                       |
| ------------------- | ------ | ----------------------------------------------------------------- |
| `customerId`        | UUID   | Customer unique identifier                                        |
| `customerName`      | String | Customer display name                                             |
| `invoiceCount`      | Long   | Number of distinct invoices in the period                         |
| `totalSales`        | Double | Total invoice amount (subtotal + tax + VAT - discount + delivery) |
| `totalTax`          | Double | Total tax amount across invoices                                  |
| `totalVat`          | Double | Total VAT amount across invoices                                  |
| `percentageOfTotal` | Double | `(totalSales / grandTotal) * 100`, rounded to 2 decimal places    |

**Invoice Filter Criteria:**

- Only invoices with status `ISSUED`, `PARTIALLY_PAID`, or `PAID`
- Invoice date must fall within `startDate` and `endDate` (inclusive)
- Only invoices linked to a customer (JOIN, not LEFT JOIN)

**Calculation Notes:**

- Subtotals are pre-aggregated per invoice via subquery on `product_sale` to avoid row multiplication of invoice-level fields (`total_discount`, `delivery_charge`)
- `totalSales` = `subtotal * (1 + tax/100 + vat/100) - total_discount + delivery_charge`
- `percentageOfTotal` is 0.00 when `grandTotal` is zero

#### PDF Download Endpoint

```
GET /pdf/v1/report/{orgId}/sales-by-customer/download?startDate={date}&endDate={date}
```

**Auth:** Requires `REPORTING` module access.

**Parameters:** Same as JSON endpoint.

**Response: `200 OK`**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=sales-by-customer-{orgId}.pdf`
- Body: PDF byte stream
