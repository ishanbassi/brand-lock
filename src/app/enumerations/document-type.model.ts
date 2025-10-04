export enum DocumentType {
  OTHERS = 'OTHERS',

  LOGO = 'LOGO',

  ADDRESS_PROOF = 'ADDRESS_PROOF',

  SIGNED_POA = 'SIGNED_POA',
}

export const DocumentTypeValues = [
  {label: 'Others', value: DocumentType.OTHERS},
  {label: 'Logo', value: DocumentType.LOGO},
  {label: 'Address Proof', value: DocumentType.ADDRESS_PROOF},
  {label: 'Signed POA', value: DocumentType.SIGNED_POA},
]