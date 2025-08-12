import type { OnboardingStep } from './types';

export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'complete_profile',
    title: 'Complete your profile',
    description: 'Add your name and profile picture to personalize your account',
    completed: false,
    action: {
      label: 'Update profile',
      href: '/settings/profile',
    },
  },
  {
    id: 'upload_first_file',
    title: 'Upload your first file',
    description: 'Try our file storage by uploading a document or image',
    completed: false,
    optional: true,
    action: {
      label: 'Upload file',
      href: '/storage',
    },
  },
  {
    id: 'setup_billing',
    title: 'Set up billing',
    description: 'Add a payment method to unlock premium features',
    completed: false,
    optional: true,
    action: {
      label: 'Add payment method',
      href: '/settings/billing',
    },
  },
  {
    id: 'explore_dashboard',
    title: 'Explore your dashboard',
    description: 'Get familiar with your main workspace and available features',
    completed: false,
    action: {
      label: 'View dashboard',
      href: '/dashboard',
    },
  },
];

export const ORGANIZATION_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'setup_organization',
    title: 'Set up your organization',
    description: 'Add your organization details and branding',
    completed: false,
    action: {
      label: 'Organization settings',
      href: '/settings/organization',
    },
  },
  {
    id: 'invite_team_members',
    title: 'Invite team members',
    description: 'Collaborate with your team by sending invitations',
    completed: false,
    optional: true,
    action: {
      label: 'Invite members',
      href: '/settings/members',
    },
  },
  {
    id: 'configure_permissions',
    title: 'Configure permissions',
    description: 'Set up roles and permissions for your organization',
    completed: false,
    optional: true,
    action: {
      label: 'Manage permissions',
      href: '/settings/permissions',
    },
  },
  ...DEFAULT_ONBOARDING_STEPS.filter(step => step.id !== 'setup_billing'), // Organization billing is separate
];