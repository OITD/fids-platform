import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router';

export function Callback() {
  const navigate = useNavigate();

  const { isLoading } = useHandleSignInCallback(() => {
    // After successful sign-in, redirect to verification
    navigate('/subscription/verify');
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Signing you in...</div>
      </div>
    );
  }

  return null;
}
