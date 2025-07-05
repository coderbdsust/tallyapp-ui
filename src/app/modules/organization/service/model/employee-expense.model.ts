import { Employee } from "./employee.model"
import { Organization } from "./organization.model"

export interface EmployeeExpense {
  id: string
  amount: number
  expenseDate: string
  description: string
  category: string
  status: string
  expenseType: string
  receiptNumber: any
  notes: any
  isReimbursable: boolean
  reimbursedAmount: number
  reimbursedDate: any
  createdDate: string
  updatedDate: any
  employee: Employee,
  organiation:Organization,
  transaction: any
}