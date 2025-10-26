export enum TrademarkStatus {

  DRAFT = 'DRAFT',
    FILED  = 'FILED',
    UNDER_EXAMINATION = 'UNDER_EXAMINATION',
    OBJECTED =  'OBJECTED',
    EXAMINATION_REPLY_FILED = 'EXAMINATION_REPLY_FILED',
    ACCEPTED_AND_ADVERTISED = 'ACCEPTED_AND_ADVERTISED',
    OPPOSED =  'OPPOSED',
    HEARING = 'HEARING',
    REGISTERED = 'REGISTERED',
    ABANDONED = 'ABANDONED',
    WITHDRAWN = 'WITHDRAWN',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    RENEWED = 'RENEWED',
    UNKNOWN = 'UNKNOWN'
}

export const TrademarkStatusTypeList = [
    { value: TrademarkStatus.DRAFT, label: 'Draft' },
    { value: TrademarkStatus.FILED, label: 'Filed' },
    { value: TrademarkStatus.UNDER_EXAMINATION, label: 'Under Examination' },
    { value: TrademarkStatus.OBJECTED, label: 'Objected' },
    { value: TrademarkStatus.EXAMINATION_REPLY_FILED, label: 'Examination Reply Filed' },
    { value: TrademarkStatus.ACCEPTED_AND_ADVERTISED, label: 'Accepted and Advertised' },
    { value: TrademarkStatus.OPPOSED, label: 'Opposed' },
    { value: TrademarkStatus.HEARING, label: 'Hearing' },
    { value: TrademarkStatus.UNKNOWN, label: 'Unknown' },
    { value: TrademarkStatus.REGISTERED, label: 'Registered' }


    ]