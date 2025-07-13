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
  productCategory: ProductCategory;
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

export interface ProductStatistics{
  totalProductCount: number;
  totalAvailableProductCount: number;
  totalProductSoldCount:number;
  totalEmployeeCostSum: number;
  totalProductionCostSum: number;
  totalPaymentCollectedSum: number;
}

export interface ProductCategory{
  id:string|null;
  name:string;
  description:string;
  active:boolean;
}