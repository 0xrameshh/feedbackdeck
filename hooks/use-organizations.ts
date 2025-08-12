import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

interface Organization {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  polarCustomerId: string | null;
  subscriptionStatus: string | null;
  currentPlan: string | null;
  subscriptionId: string | null;
  role: 'owner' | 'admin' | 'member';
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user?.id) {
      loadOrganizations();
    } else {
      setOrganizations([]);
      setLoading(false);
    }
  }, [session?.user?.id]);

  async function loadOrganizations() {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  return {
    organizations,
    loading,
    reload: loadOrganizations
  };
}