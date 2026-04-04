# TallyApp REST API Documentation

**Base URL:** `http://localhost:{port}/tallyapp`
**Auth:** Bearer JWT token (all endpoints require authentication)
**Swagger UI:** `/tallyapp/swagger-ui.html`

**Base path:** `/invoice/v1`

### POST `/{organizationId}/create-with-details` — Create Invoice with Details

Creates a DRAFT invoice with optional customer, tax rate, and VAT rate. If tax/vat not provided, defaults to organization values.

**Request:**

```json
{
  "customerId": "c1d2e3f4-...",
  "tax": 7.5,
  "vat": 12.0
}
```

| Field        | Type   | Required | Description                               |
| ------------ | ------ | -------- | ----------------------------------------- |
| `customerId` | UUID   | No       | Customer to assign to the invoice         |
| `tax`        | Double | No       | Tax rate % (defaults to organization tax) |
| `vat`        | Double | No       | VAT rate % (defaults to organization vat) |

**Validation:**

- Customer must belong to the organization (if provided)

**Response:** Same `InvoiceResponse` as `/{organizationId}/create`.

---
