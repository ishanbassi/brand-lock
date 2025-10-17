import { Household } from "./household"

export interface ReportData {
    fromStartDate: string
    toEndDate: string
    lastMonthDate: string
    household: Household
    savings: Savings
    statement: Statement
    transactions: SummaryPaymentTransaction[]
    withdrawals: any[]
    pendings: Pending[]
    upcomingWithdrawals: UpcomingWithdrawal[]
    escrowDepositTransactions: EscrowDepositTransaction[]
    escrowReleaseTransactions: any[]
    pendingWithdrawals: PendingWithdrawal[]
    expectedUpcomingTransactions: ExpectedUpcomingTransaction[]
    errors: any[]
  }
  
  export interface Savings {
    begin: number
    lifetime: number
    end: number
  }
  
  export interface Statement {
    end: number
    fund: number
    begin: number
    transactions: number
    monthlyTransactions: number
    subscription: number
    upcomingTransactions: number
    estimatedBalanceAdjustment: number
    monthlyWithdraw: number
    biMonthlyWithdraw: number
    pendingTransactions: number
    expectedBalance: number
    escrowDepositTransactions: number
    escrowReleaseTransactions: number
    escrowBegin: number
    escrowEnd: number
    monthlyPendingWithdrawals: number
    biMonthlyPendingWithdrawals: number
  }
  
  export interface SummaryPaymentTransaction {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: boolean
    included: boolean
    provider: string
    provider_description: string
    variable: boolean
    frequency: string
    one_time_amount: number
    previous_amount: number
    id: number
    escrow: any
    estimated_amount: number
    transaction_date: string
    transaction_type: string
    savings: number
    account_id: string
    provider_id: number
    account_id_key: any
  }
  
  export interface Pending {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: boolean
    included: boolean
    provider: string
    provider_description: string
    variable: boolean
    frequency: string
    one_time_amount: number
    previous_amount: number
    id: any
    escrow: any
    estimated_amount: number
    transaction_date: any
    transaction_type: any
    savings: number
    account_id: string
    provider_id: number
    account_id_key: any
  }
  
  export interface UpcomingWithdrawal {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: any
    included: boolean
    provider: any
    provider_description: any
    variable: any
    frequency: any
    one_time_amount: number
    previous_amount: number
    id: any
    escrow: any
    estimated_amount: number
    transaction_date: any
    transaction_type: any
    savings: number
    account_id: any
    provider_id: any
    account_id_key: any
  }
  
  export interface EscrowDepositTransaction {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: boolean
    included: boolean
    provider: string
    provider_description: string
    variable: boolean
    frequency: string
    one_time_amount: number
    previous_amount: number
    id: number
    escrow: any
    estimated_amount: number
    transaction_date: string
    transaction_type: string
    savings: number
    account_id: string
    provider_id: number
    account_id_key: any
  }
  
  export interface PendingWithdrawal {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: any
    included: boolean
    provider: any
    provider_description: any
    variable: any
    frequency: any
    one_time_amount: number
    previous_amount: number
    id: any
    escrow: any
    estimated_amount: any
    transaction_date: any
    transaction_type: any
    savings: number
    account_id: any
    provider_id: any
    account_id_key: any
  }
  
  export interface ExpectedUpcomingTransaction {
    due: string
    note: any
    total: number
    amount: number
    released_amount: number
    managed: boolean
    included: boolean
    provider: string
    provider_description: string
    variable: boolean
    frequency: string
    one_time_amount: number
    previous_amount: number
    id?: number
    escrow: any
    estimated_amount: number
    transaction_date?: string
    transaction_type: string
    savings: number
    account_id: string
    provider_id: number
    account_id_key: any
  }
  