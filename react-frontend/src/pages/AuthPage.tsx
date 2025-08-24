import React from 'react';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-primary-900 mb-8">Welcome Back</h1>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-primary-600 text-center">Authentication functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;