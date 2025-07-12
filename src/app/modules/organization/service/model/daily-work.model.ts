export interface DailyWork {
    dailyWorkId: string;
    entryDate: string;
    employeeWorkUnits: EmployeeWorkUnit[];
    status: string;
}

export interface EmployeeWorkUnit {
    employeeWorkUnitId:string;
    employeeId: string;
    employeeName: string;
    billingType: string;
    workUnit: number;
    workUnitRate: number;
    isPresent: boolean;
    expense: number;
}