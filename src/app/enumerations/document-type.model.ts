export enum DocumentType {
  OTHERS = 'OTHERS',

  LOGO = 'LOGO',

  ADDRESS_PROOF = 'ADDRESS_PROOF',

  SIGNED_POA = 'SIGNED_POA',
  
  APPLICANT_IDENTITY = 'APPLICANT_IDENTITY'
}

export const DocumentTypeValues:DocumentTypeValues[] = [
  
  {label: 'Logo', value: DocumentType.LOGO},
  {label: 'Address Proof', value: DocumentType.ADDRESS_PROOF},
  {label: 'Signed Power Of Attorney', value: DocumentType.SIGNED_POA},
  {label: 'Proof of Applicant Identity', value: DocumentType.APPLICANT_IDENTITY},
  {label: 'Others', value: DocumentType.OTHERS},
]

export interface DocumentTypeValues{
  label:string;
  value:DocumentType;
  disabled?:boolean;
}