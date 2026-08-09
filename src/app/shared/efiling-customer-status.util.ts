/**
 * Customer-facing translation of the internal EfilingStatus enum.
 *
 * The backend vocabulary is for ops ("AWAITING_PROPRIETOR_CODE"), and showing it to a
 * customer would be both meaningless and slightly alarming. This maps each internal
 * state to what the customer actually needs to know: what's happening, and whether the
 * ball is in their court.
 *
 * Keep in sync with com.bassi.tmapp.domain.enumeration.EfilingStatus.
 */

export interface CustomerFilingView {
  /** Short label for the progress chip. */
  label: string;
  /** One sentence explaining the state in the customer's terms. */
  detail: string;
  /** True when we're blocked on the customer — drives the urgent styling. */
  needsCustomer: boolean;
  /** 0–100, for the progress bar. */
  progress: number;
}

const VIEWS: Record<string, CustomerFilingView> = {
  NOT_STARTED: {
    label: 'Preparing',
    detail: "We're getting your application ready to submit to the Registry.",
    needsCustomer: false,
    progress: 10,
  },
  AWAITING_SIGNER_ID: {
    label: 'Verification needed',
    detail: 'Complete your one-time identity verification above so we can file on the Registry portal.',
    needsCustomer: true,
    progress: 20,
  },
  AWAITING_PROPRIETOR_CODE: {
    // The customer does not need to know what a Proprietor Code is.
    label: 'Setting up',
    detail: "We're setting up your applicant record with the Trade Marks Registry.",
    needsCustomer: false,
    progress: 35,
  },
  READY_TO_FILE: {
    label: 'Ready to file',
    detail: 'Everything is in order. Your application is queued for submission.',
    needsCustomer: false,
    progress: 50,
  },
  AWAITING_APPLICANT_OTP: {
    label: 'We need your OTP',
    detail:
      'The Registry has sent a one-time password to your registered mobile. Please keep your phone ' +
      'to hand — our team is on the filing screen right now and will call you to read it out.',
    needsCustomer: true,
    progress: 65,
  },
  ACCOUNT_REGISTERED: {
    label: 'Account ready',
    detail: 'Your Registry account is active. Your trademark application is being submitted now.',
    needsCustomer: false,
    progress: 80,
  },
  FILED: {
    label: 'Filed',
    detail: 'Your application has been submitted to the Trade Marks Registry.',
    needsCustomer: false,
    progress: 100,
  },
  FAILED: {
    label: 'Needs attention',
    detail: "Something held up the submission. Our team is on it and will be in touch.",
    needsCustomer: false,
    progress: 50,
  },
};

const FALLBACK: CustomerFilingView = VIEWS['NOT_STARTED'];

export function customerFilingView(status?: string | null): CustomerFilingView {
  if (!status) return FALLBACK;
  return VIEWS[status] ?? FALLBACK;
}

/** Whether this application is far enough along to be worth showing a filing tracker. */
export function hasFilingProgress(status?: string | null): boolean {
  return !!status && status !== 'NOT_STARTED';
}
