import dayjs from 'dayjs/esm';
import { ITrademark } from './trademark.model';
import { DocumentType } from '../app/enumerations/document-type.model';

export interface IDocuments {
  id: number;
  documentType?: keyof typeof DocumentType | null;
  fileContentType?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
  trademark?: Pick<ITrademark, 'id'> | null;
}

export type NewDocuments = Omit<IDocuments, 'id'> & { id: null };
