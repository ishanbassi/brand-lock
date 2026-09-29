import dayjs from 'dayjs/esm';
import { ILead } from './lead.model';
import { HeadOffice } from '../app/enumerations/head-office.model';
import { TrademarkType } from '../app/enumerations/trademark-type.model';
import { TrademarkSource } from '../app/enumerations/trademark-source.model';
import { IUserProfile } from './user-profile.model';
import { IDocuments } from './documents.model';
import { ITrademarkClass } from './trademark-class.model';
import { ITrademarkPlan } from './trademark-plan.model';
import { TrademarkStatus } from '../app/enumerations/trademark-status.model';
import { SimilarityMatchType } from '../app/enumerations/similarity-match-type.model';

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
  ocrExtracted?: boolean | null;
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
  phoneNumber?: string | null;
  email?: string | null;
  organizationType?: string | null;
  filingMode?: string | null;
  /** Assisted self-filing progress. Internal ops vocabulary — never render it raw
   *  to a customer; translate via efiling-customer-status.util.ts first. */
  efilingStatus?: string | null;
  trademarkClasses?: Pick<ITrademarkClass, 'id'>[] | null;
  trademarkPlan?: Pick<ITrademarkPlan, 'id' | 'name'> | null;
  documents?: Pick<IDocuments, 'id'| 'documentType'>[] | null;
  url?:string;
  faqs?:{question:string;answer:string;opened:boolean}[];
  slug?:string;

  /** How alike this mark and the searched term are, 0..1. Set only by the scored search paths. */
  score?: number;
  /** Why a search returned this row — resemblance, or one mark carrying the other. */
  matchType?: SimilarityMatchType | null;
  /** The mark found inside the other one, when `matchType` says there is one. */
  embeddedMark?: string | null;

  


}

export type NewTrademark = Omit<ITrademark, 'id'> & { id: null };

export type ITrademarkWithLogo = {
  trademark: ITrademark  | null
  document: IDocuments | null
}
