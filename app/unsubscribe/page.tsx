'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const error = searchParams.get('error');
  const type = searchParams.get('type');

  const getEmailTypeLabel = (emailType: string | null) => {
    switch (emailType) {
      case 'marketing':
        return 'marketing emails';
      case 'product':
        return 'product update emails';
      case 'digest':
        return 'weekly digest emails';
      case 'all':
        return 'all marketing emails';
      default:
        return 'selected emails';
    }
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing-token':
        return 'No unsubscribe token provided. Please use the link from your email.';
      case 'invalid-token':
        return 'Invalid or expired unsubscribe link. Please use the most recent email.';
      case 'failed':
        return 'Failed to process your unsubscribe request. Please try again.';
      case 'server-error':
        return 'A server error occurred. Please try again later.';
      default:
        return 'An unknown error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {success ? (
              <CheckCircle className="h-12 w-12 text-green-600" />
            ) : error ? (
              <XCircle className="h-12 w-12 text-red-600" />
            ) : (
              <Mail className="h-12 w-12 text-blue-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {success ? 'Unsubscribed Successfully' : error ? 'Unsubscribe Failed' : 'Email Preferences'}
          </CardTitle>
          
          <CardDescription>
            {success 
              ? `You've been unsubscribed from ${getEmailTypeLabel(type)}.`
              : error 
              ? getErrorMessage(error)
              : 'Manage your email subscription preferences.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• You&apos;ll stop receiving {getEmailTypeLabel(type)}</li>
                <li>• Important account and billing emails will still be sent</li>
                <li>• You can resubscribe anytime in your account settings</li>
              </ul>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Need help?</h3>
              <p className="text-sm text-red-700">
                If you continue to have issues, please contact our support team at{' '}
                <a href="mailto:support@saas-template.com" className="underline">
                  support@saas-template.com
                </a>
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              {success ? 'Go to Dashboard' : 'Sign In to Manage Preferences'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}