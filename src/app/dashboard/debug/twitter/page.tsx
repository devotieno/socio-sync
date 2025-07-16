'use client';

import { useState } from 'react';
import { RefreshCw, Twitter, AlertCircle, CheckCircle } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  children: React.ReactNode;
}

// Simple UI components
const Card = ({ children, className = "" }: CardProps) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button = ({ children, variant = "default", className = "", ...props }: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 h-10 px-4 py-2",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 h-10 px-4 py-2",
    ghost: "hover:bg-gray-100 hover:text-gray-900 h-10 px-4 py-2",
    link: "text-blue-600 underline-offset-4 hover:underline h-10 px-4 py-2",
    destructive: "bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2",
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Alert = ({ children, className = "" }: CardProps) => (
  <div role="alert" className={`relative w-full rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

export default function TwitterDebugPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch('/api/twitter/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: 'Failed to test connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const resetConnection = async () => {
    try {
      const response = await fetch('/api/twitter/reset', { method: 'POST' });
      if (response.ok) {
        alert('Twitter connection reset. Please re-authenticate.');
        window.location.href = '/connect-accounts';
      } else {
        alert('Failed to reset connection');
      }
    } catch (error) {
      alert('Error resetting connection');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Twitter className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Twitter Connection Debug</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Twitter Connection</CardTitle>
          <CardDescription>
            This tool helps debug issues with your Twitter connection and posting functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={testConnection} 
              disabled={testing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              Test Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={resetConnection}
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Reset & Reconnect
            </Button>
          </div>

          {result && (
            <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    {result.success ? (
                      <div className="space-y-2">
                        <p className="font-medium text-green-700">✅ Connection Successful!</p>
                        <div className="text-sm">
                          <p><strong>User:</strong> @{result.user.username} ({result.user.name})</p>
                          <p><strong>API Version:</strong> {result.api_version}</p>
                          <p><strong>User ID:</strong> {result.user.id}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium text-red-700">❌ Connection Failed</p>
                        <p className="text-sm">{result.error}</p>
                        {result.details && (
                          <div className="text-xs bg-gray-100 p-2 rounded mt-2">
                            <pre>{JSON.stringify(result.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800">Error 401 / 215: Bad Authentication Data</h4>
              <p className="text-yellow-700 mt-1">
                Your Twitter tokens are invalid or expired. This usually happens when:
              </p>
              <ul className="list-disc list-inside text-yellow-700 mt-1 ml-2">
                <li>You changed your Twitter app's consumer keys</li>
                <li>Your access tokens were generated with different consumer keys</li>
                <li>Your Twitter app permissions changed</li>
              </ul>
              <p className="text-yellow-700 mt-2">
                <strong>Solution:</strong> Click "Reset & Reconnect" above to re-authenticate.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800">Twitter App Requirements</h4>
              <p className="text-blue-700 mt-1">
                Ensure your Twitter Developer App has:
              </p>
              <ul className="list-disc list-inside text-blue-700 mt-1 ml-2">
                <li><strong>Elevated</strong> access level (not Essential)</li>
                <li><strong>Read and Write</strong> permissions (not Read-only)</li>
                <li>Valid OAuth 1.0a settings</li>
              </ul>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <h4 className="font-medium text-green-800">Environment Variables</h4>
              <p className="text-green-700 mt-1">
                Make sure these are set correctly in your .env.local:
              </p>
              <ul className="list-disc list-inside text-green-700 mt-1 ml-2">
                <li>TWITTER_CONSUMER_KEY (your app's API key)</li>
                <li>TWITTER_CONSUMER_SECRET (your app's API secret)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
