export enum DocumentType {
  OTHERS = 'OTHERS',

  LOGO = 'LOGO',

  ADDRESS_PROOF = 'ADDRESS_PROOF',

  SIGNED_POA = 'SIGNED_POA',

  APPLICANT_IDENTITY = 'APPLICANT_IDENTITY',

  PAN_CARD = 'PAN_CARD',

  MSME_CERTIFICATE = 'MSME_CERTIFICATE'
}

export const DocumentTypeValues:DocumentTypeValues[] = [

  {label: 'Logo', value: DocumentType.LOGO},
  {label: 'Address Proof (GST)', value: DocumentType.ADDRESS_PROOF},
  {label: 'Signed Power Of Attorney', value: DocumentType.SIGNED_POA},
  {label: 'Proof of Applicant Identity (Adhaar Card)', value: DocumentType.APPLICANT_IDENTITY},
  {label: 'PAN Card', value: DocumentType.PAN_CARD},
  {label: 'MSME / Udyam Certificate', value: DocumentType.MSME_CERTIFICATE},
  {label: 'Others', value: DocumentType.OTHERS},
]

export interface DocumentTypeValues{
  label:string;
  value:DocumentType;
  disabled?:boolean;
}