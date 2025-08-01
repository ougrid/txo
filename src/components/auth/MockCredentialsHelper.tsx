import React, { useState } from 'react';

interface MockCredentialsHelperProps {
  onSelectCredentials?: (email: string, password: string) => void;
}

const MockCredentialsHelper: React.FC<MockCredentialsHelperProps> = ({ onSelectCredentials }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Define mock credentials directly to avoid potential server-side issues
  const mockCredentials = [
    {
      email: 'admin@miniseller.com',
      password: 'Admin123!',
      role: 'Administrator'
    },
    {
      email: 'demo@shopowner.com',
      password: 'Demo123!',
      role: 'Shop Owner'
    },
    {
      email: 'seller@thaistore.co.th',
      password: 'Seller123!',
      role: 'Seller'
    },
    {
      email: 'analyst@datacorp.th',
      password: 'Analyst123!',
      role: 'Data Analyst'
    }
  ];

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        title="Show test credentials"
      >
        🔑 Test Users
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Test User Credentials
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {mockCredentials.map((user, index) => (
              <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {user.role}
                  </span>
                  {onSelectCredentials && (
                    <button
                      onClick={() => onSelectCredentials(user.email, user.password)}
                      className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Use
                    </button>
                  )}
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
                      {user.email}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Password:</span>
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-800 dark:text-gray-200">
                      {user.password}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-xs text-yellow-700 dark:text-yellow-300">
            <strong>⚠️ Development Only:</strong> These credentials are for testing purposes and will not appear in production builds.
          </div>
        </div>
      )}
    </div>
  );
};

export default MockCredentialsHelper;
