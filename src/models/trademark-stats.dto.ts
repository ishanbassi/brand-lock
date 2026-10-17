import { Dayjs } from "dayjs/esm";
import { ITrademark } from "./trademark.model";

export interface TrademarkStats{
    applicationsFiled:number;
    lastUpdated:Dayjs;
    recentFilings:ITrademark[];
    totalTrademarks:number


}
