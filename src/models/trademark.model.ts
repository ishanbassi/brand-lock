import dayjs from 'dayjs/esm';
import { ILead } from './lead.model';
import { HeadOffice } from '../app/enumerations/head-office.model';
import { TrademarkType } from '../app/enumerations/trademark-type.model';
import { TrademarkSource } from '../app/enumerations/trademark-source.model';
import { IUserProfile } from './user-profile.model';
import { IDocuments } from './documents.model';
import { ITrademarkClass } from './trademark-class.model';

export interface ITrademark {
  id: number;
  name?: string | null;
  details?: string | null;
  applicationNo?: number | null;
  applicationDate?: dayjs.Dayjs | null;
  agentName?: string | null;
  agentAddress?: string | null;
  proprietorName?: string | null;
  proprietorAddress?: string | null;
  headOffice?: keyof typeof HeadOffice | null;
  imgUrl?: string | null;
  tmClass?: number | null;
  journalNo?: number | null;
  deleted?: boolean | null;
  usage?: string | null;
  associatedTms?: string | null;
  trademarkStatus?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  renewalDate?: dayjs.Dayjs | null;
  type?: keyof typeof TrademarkType | null;
  pageNo?: number | null;
  source?: keyof typeof TrademarkSource | null;
  lead?: Pick<ILead, 'id'> | null;
  user?: Pick<IUserProfile, 'id'> | null;
  trademarkClasses?: Pick<ITrademarkClass, 'id'>[] | null;

}

export type NewTrademark = Omit<ITrademark, 'id'> & { id: null };

export type ITrademarkWithLogo = {
  trademark: ITrademark 
  document: IDocuments
}
