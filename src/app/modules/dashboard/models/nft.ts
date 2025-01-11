export interface Nft {
  id: number;
  title: string;
  startAt?:string;
  creator?: string;
  avatar?: string;
  image: string;
  ending_in?:string;
  last_bid?:number;
  price?:number;
  instant_price?:number;
  topEmployee?:string;
  topEmployeeMonth?:string;
  totalEmployee?:number;
}
