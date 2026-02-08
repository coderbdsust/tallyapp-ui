import { Employee } from "./employee.model"

export interface Product {
  id: string,
  name: string,
  code: string,
  description: string,
  unitType: UnitType,
  perUnitEmployeeCost: number,
  perUnitProductionCost: number,
  unitPrice: number,
  discountPercent: number,
  availableQuantity: number,
  initialQuantity: number,
  imageUrl: string,
  createdDate: string,
  madeBy: Employee
  productStockList: ProductStock[] | null;
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
  discountPercent:number;
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

export interface UnitType{
  value: string;
  symbol: string;
  displayName: boolean;
}

export interface ProductToSale {
  productId: string
  productName: string
  productDescription: string
  productUnitRate: number
  productQuantity: number
  productAmount: number
}
