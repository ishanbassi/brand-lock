import dayjs, { Dayjs } from "dayjs/esm";
import { ITrademark } from "./trademark.model";

export interface TrademarkStats{
    applicationsFiled:number;
    lastUpdated:Dayjs;
    recentFilings:ITrademark[];
    journalStatsDto:JournalStatsDto;
    totalTrademarks:number


}

export interface JournalStatsDto{
    journalNo:number;
    count:number;
    publishedDate:dayjs.Dayjs | null

}