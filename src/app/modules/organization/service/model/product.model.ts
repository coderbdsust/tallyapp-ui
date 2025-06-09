import { Employee } from "./employee.model"

export interface Product {
  id: string,
  name: string,
  code: string,
  description: string,
  perUnitEmployeeCost: number,
  perUnitProductionCost: number,
  unitPrice: number,
  availableQuantity: number,
  initialQuantity: number,
  imageUrl: string,
  createdDate: string,
  madeBy: Employee
  productStockList:ProductStock[] | null;
}

export interface ProductStock {
  id: string;
  batchNumber: string;
  initialQuantity: string;
  availableQuantity: string;
  manufactureDate: string;
  expiryDate: string;
  unitPrice: number;
  perUnitProductionCost: number;
  perUnitEmployeeCost: number;
}
