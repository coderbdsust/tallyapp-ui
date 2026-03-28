GET /customer/v1/{orgId}/{customerId}/unpaid-invoices?page=0&size=10

```json
{
    "content": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-003",
        "invoiceDate": "2026-03-28",
        "invoiceStatus": "DRAFT",
        "totalAmount": 5000.00,
        "totalPaid": 0.00,
        "remainingAmount": 5000.00
      },
      {
        "id": "uuid",
        "invoiceNumber": "INV-002",
        "invoiceDate": "2026-03-25",
        "invoiceStatus": "ISSUED",
        "totalAmount": 8000.00,
        "totalPaid": 0.00,
        "remainingAmount": 8000.00
      },
      {
        "id": "uuid",
        "invoiceNumber": "INV-001",
        "invoiceDate": "2026-03-20",
        "invoiceStatus": "PARTIALLY_PAID",
        "totalAmount": 10000.00,
        "totalPaid": 4000.00,
        "remainingAmount": 6000.00
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 3,
    "totalPages": 1,
    "first": true,
    "last": true

```

1. add payment recive button on customer list page top right, before add customer button.
2. button is clicked , payment drawer open, design will be like add customer drawer
3. customer will be selected from dropdown with infinit scroll. use existing getCustomerByOrganization api with search.
4. if paymentOnInvoice true , unpaid invoice list (using above api) will be available can be selected.
5. if paymentOnInvoice false, customer will be selected and payment will be recorded against customer receivePayment api.
