export enum OrganizationType {
  PRIVATE_COMPANY = 'PRIVATE_COMPANY',
  PUBLIC_COMPANY = 'PUBLIC_COMPANY',
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
  OTHER = 'OTHER'
}

export const OrganizationTypeValues = [
  {label: 'Private Company', value: OrganizationType.PRIVATE_COMPANY},
  {label: 'Public Company', value: OrganizationType.PUBLIC_COMPANY},
  {label: 'Sole Proprietorship', value: OrganizationType.SOLE_PROPRIETORSHIP},
  {label: 'Partnership', value: OrganizationType.PARTNERSHIP},
  {label: 'Other', value: OrganizationType.OTHER},
]
