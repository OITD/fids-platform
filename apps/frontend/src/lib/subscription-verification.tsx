import { useEffect, useState } from 'react';
import { useLogto } from '@logto/react';

interface UserSubscription {
  id: string;
  status: string;
  priceId: string;
  currentPeriodEnd: number;
}

interface UserCustomData {
  subscription?: UserSubscription;
  stripeCustomerId?: string;
}

export function SubscriptionVerification() {
  const { isAuthenticated, fetchUserInfo } = useLogto();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!isAuthenticated) {
        window.location.href = '/';
        return;
      }

      try {
        const userInfo = await fetchUserInfo();
        const customData = userInfo.custom_data as UserCustomData;
        
        // Check subscription status from custom_data
        const hasActiveSubscription = customData?.subscription?.status === 'active';

        if (!hasActiveSubscription) {
          window.location.href = '/subscription/subscribe';
          return;
        }

        window.location.href = '/';
      } catch (error) {
        console.error('Subscription verification error:', error);
        window.location.href = '/error';
      } finally {
        setVerifying(false);
      }
    };

    verifySubscription();
  }, [isAuthenticated, fetchUserInfo]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600 mb-4">Verifying your subscription...</div>
          <div className="text-sm text-gray-500">This will only take a moment</div>
        </div>
      </div>
    );
  }

  return null;
}
