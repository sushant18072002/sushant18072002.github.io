import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-9xl font-bold text-primary-200 mb-4">404</div>
        <h1 className="text-4xl font-bold text-primary-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-primary-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;