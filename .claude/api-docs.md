# TallyApp REST API Documentation

**Base URL:** `http://localhost:{port}/tallyapp`
**Auth:** Bearer JWT token (all endpoints require authentication)
**Swagger UI:** `/tallyapp/swagger-ui.html`

## 3. Customer

**Base path:** `/customer/v1`

| Method | Path                             | Description                                                         |
| ------ | -------------------------------- | ------------------------------------------------------------------- |
| GET    | `/{organizationId}`              | List customers (paginated) — `search` (""), `page` (0), `size` (10) |
| GET    | `/{organizationId}/{customerId}` | Get customer                                                        |
| POST   | `/{organizationId}`              | Create customer                                                     |
| PUT    | `/{organizationId}/{customerId}` | Edit customer                                                       |

**Notes:**

- `GET /{organizationId}` returns all customers when `search` is empty. Filters by name, mobile, or email when `search` has 3+ characters.

### POST `/{organizationId}` — Create Customer

**Request:**

```json
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "mobile": "01711223344",
  "address": "45 Gulshan Avenue, Dhaka",
  "postcode": "1212"
}
```

**Response:**

```json
{
  "id": "c1d2e3f4-...",
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "mobile": "01711223344",
  "address": "45 Gulshan Avenue, Dhaka",
  "postcode": "1212"
}
```

### PUT `/{organizationId}/{customerId}` — Edit Customer

**Request:**

```json
{
  "name": "Rahim Uddin (Updated)",
  "email": "rahim.new@example.com",
  "mobile": "01711223355",
  "address": "50 Banani Road, Dhaka",
  "postcode": "1213"
}
```

**Response:**

```json
{
  "id": "c1d2e3f4-...",
  "name": "Rahim Uddin (Updated)",
  "email": "rahim.new@example.com",
  "mobile": "01711223355",
  "address": "50 Banani Road, Dhaka",
  "postcode": "1213"
}
```

### GET `/{organizationId}` — List Customers

**Response:**

```json
{
  "content": [
    {
      "id": "c1d2e3f4-...",
      "name": "Rahim Uddin",
      "email": "rahim@example.com",
      "mobile": "01711223344",
      "address": "45 Gulshan Avenue, Dhaka",
      "postcode": "1212"
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

## 6. Invoice

**Base path:** `/invoice/v1`

| Method | Path                                  | Description                                                                               |
| ------ | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| POST   | `/{organizationId}/create`            | Create draft invoice                                                                      |
| GET    | `/{organizationId}`                   | List invoices (paginated) — `search` (""), `searchCriteria` (""), `page` (0), `size` (10) |
| GET    | `/{organizationId}/{invoiceId}`       | Get invoice                                                                               |
| PUT    | `/{invoiceId}`                        | Update invoice                                                                            |
| DELETE | `/{invoiceId}`                        | Delete invoice                                                                            |
| POST   | `/{invoiceId}/add`                    | Add product to invoice                                                                    |
| POST   | `/{invoiceId}/create-and-add`         | Create product and add to invoice                                                         |
| DELETE | `/{invoiceId}/{productSaleId}/remove` | Remove product from invoice                                                               |

### PUT `/{invoiceId}` — Update Invoice

**Request:**

```json
{
  "invoiceDate": "2026-03-17",
  "invoiceStatus": "ISSUED",
  "customerId": "c1d2e3f4-...",
  "totalDiscount": 50.0,
  "deliveryCharge": 100.0,
  "deliveryDate": "2026-03-20"
}
```

**Response:**

```json
{
  "id": "a1b2c3d4-...",
  "invoiceNumber": "INV-ACME-0001",
  "invoiceDate": "2026-03-17",
  "deliveryDate": "2026-03-20",
  "deliveryCharge": 100.0,
  "totalDiscount": 50.0,
  "vatRate": 15.0,
  "taxRate": 5.0,
  "invoiceStatus": "ISSUED",
  "customer": {
    "id": "c1d2e3f4-...",
    "name": "Rahim Uddin",
    "email": "rahim@example.com",
    "mobile": "01711223344",
    "address": "45 Gulshan Avenue, Dhaka",
    "postcode": "1212"
  },
  "productSales": [],
  "payments": [],
  "totalPaid": 0.0,
  "productSubTotal": 0.0,
  "productTotalTax": 0.0,
  "productTotalVat": 0.0,
  "totalAmount": 50.0,
  "remainingAmount": 50.0,
  "isFullyPaid": false
}
```
