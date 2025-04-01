import { Employee } from "./employee.model"

export interface Product {
    id: string
    name: string
    description: string
    employeeCost: number
    productionCost: number
    sellingPrice: number
    soldPrice: number
    imageUrl: string
    sold: boolean
    soldDate: string,
    madeBy: Employee
  }
  