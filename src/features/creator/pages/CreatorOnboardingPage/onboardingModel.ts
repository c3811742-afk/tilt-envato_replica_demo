import { creatorApplication } from '@/shared/constants';
import type { Text } from '@/shared/constants';
import type { CreatorApplication, CreatorApplicationReceipt } from '@/shared/types';

export const onboardingSteps = ['application', 'agreement', 'identity', 'payout', 'profile'] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];

export type OnboardingErrorKey = keyof Text['creatorOnboarding']['errors'];
export type OnboardingErrors = Partial<Record<keyof CreatorApplication, OnboardingErrorKey>>;

// What every step receives.
export interface OnboardingStepProps {
  values: CreatorApplication;
  errors: OnboardingErrors;
  update: <K extends keyof CreatorApplication>(field: K, value: CreatorApplication[K]) => void;
}

// Kept in storage so the user can leave and continue later.
export interface OnboardingDraft {
  stepIndex: number;
  values: CreatorApplication;
  receipt: CreatorApplicationReceipt | null;
}

export const emptyApplication: CreatorApplication = {
  specialties: [],
  portfolioUrl: '',
  samples: null,
  about: '',
  acceptAgreement: false,
  confirmOwnership: false,
  idType: 'nationalId',
  legalName: '',
  idNumber: '',
  idFront: null,
  idBack: null,
  payoutMethod: 'bankTransfer',
  bankName: '',
  accountHolder: '',
  iban: '',
  instapayAddress: '',
  walletNumber: '',
  taxStatus: 'individual',
  taxNumber: '',
  displayName: '',
  username: '',
  bio: '',
  avatar: null,
};

export const emptyDraft: OnboardingDraft = {
  stepIndex: 0,
  values: emptyApplication,
  receipt: null,
};

// Spaces removed and Arabic-Indic digits turned into 0-9, so "٠١٠ ١٢٣" is read as "010123".
export const compact = (value: string) => value.replace(/\s+/g, '').replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660));

const { patterns, aboutMinLength, bioMaxLength } = creatorApplication;
const filled = (value: string) => value.trim().length > 0;

// Checks only the fields on one step, so the user moves forward step by step.
export const validateStep = (step: OnboardingStep, values: CreatorApplication): OnboardingErrors => {
  const errors: OnboardingErrors = {};
  switch (step) {
    case 'application':
      if (values.specialties.length === 0) errors.specialties = 'specialtiesRequired';
      if (!filled(values.portfolioUrl)) errors.portfolioUrl = 'portfolioUrlRequired';
      else if (!patterns.url.test(values.portfolioUrl.trim())) errors.portfolioUrl = 'portfolioUrlInvalid';
      if (values.about.trim().length < aboutMinLength) errors.about = 'aboutTooShort';
      break;
    case 'agreement':
      if (!values.acceptAgreement) errors.acceptAgreement = 'acceptAgreementRequired';
      if (!values.confirmOwnership) errors.confirmOwnership = 'confirmOwnershipRequired';
      break;
    case 'identity': {
      const nationalId = values.idType === 'nationalId';
      const idNumber = compact(values.idNumber);
      if (!filled(values.legalName)) errors.legalName = 'legalNameRequired';
      if (!idNumber) errors.idNumber = 'idNumberRequired';
      else if (!(nationalId ? patterns.nationalId : patterns.passport).test(idNumber))
        errors.idNumber = nationalId ? 'nationalIdInvalid' : 'passportInvalid';
      if (!values.idFront) errors.idFront = nationalId ? 'idFrontRequired' : 'passportPageRequired';
      if (nationalId && !values.idBack) errors.idBack = 'idBackRequired';
      break;
    }
    case 'payout':
      if (values.payoutMethod === 'bankTransfer') {
        if (!filled(values.bankName)) errors.bankName = 'bankNameRequired';
        if (!filled(values.accountHolder)) errors.accountHolder = 'accountHolderRequired';
        if (!patterns.iban.test(compact(values.iban).toUpperCase())) errors.iban = 'ibanInvalid';
      }
      if (values.payoutMethod === 'instapay' && !patterns.instapay.test(values.instapayAddress.trim().toLowerCase()))
        errors.instapayAddress = 'instapayInvalid';
      if (values.payoutMethod === 'vodafoneCash' && !patterns.vodafoneCash.test(compact(values.walletNumber))) errors.walletNumber = 'walletInvalid';
      if (values.taxStatus === 'business' && !patterns.taxNumber.test(compact(values.taxNumber))) errors.taxNumber = 'taxNumberInvalid';
      break;
    case 'profile':
      if (!filled(values.displayName)) errors.displayName = 'displayNameRequired';
      if (!patterns.username.test(values.username)) errors.username = 'usernameInvalid';
      if (values.bio.length > bioMaxLength) errors.bio = 'bioTooLong';
      break;
  }
  return errors;
};

export const hasErrors = (errors: OnboardingErrors) => Object.keys(errors).length > 0;

// Cleans the values before they're sent.
export const normalizeApplication = (values: CreatorApplication): CreatorApplication => ({
  ...values,
  idNumber: compact(values.idNumber),
  iban: compact(values.iban).toUpperCase(),
  walletNumber: compact(values.walletNumber),
  taxNumber: compact(values.taxNumber),
  instapayAddress: values.instapayAddress.trim().toLowerCase(),
});
