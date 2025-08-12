export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export interface OnboardingState {
  isComplete: boolean;
  currentStep?: string;
  steps: OnboardingStep[];
  completedAt?: Date;
  skippedAt?: Date;
}

export interface UserOnboarding {
  userId: string;
  organizationId?: string;
  state: OnboardingState;
  createdAt: Date;
  updatedAt: Date;
}