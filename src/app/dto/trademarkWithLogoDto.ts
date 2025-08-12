import { NewDocuments } from "../../models/documents.model";
import { ITrademark } from "../../models/trademark.model";

export interface ITrademarkWithLogoDto {
  trademark:ITrademark;
  documents: NewDocuments

}   