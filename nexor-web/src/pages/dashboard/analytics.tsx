import React, { useState } from 'react';
import { AnalyticsDashboard } from '../../components/organisms/AnalyticsDashboard';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { useMerchantManagement } from '../../hooks/useMerchantManagement';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function AnalyticsPage() {
  // Mock merchant ID for development
  const merchantId = 'merch_123456';
  
  // Hooks for data fetching
  const { merchant } = useMerchantManagement(merchantId);
  const { trackPageView } = useAnalytics();
  
  // Track page view
  React.useEffect(() => {
    trackPageView('dashboard_analytics');
  }, [trackPageView]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-300">Track your payment performance and trends</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Export Data
            </Button>
          </div>
        </div>
        
        <AnalyticsDashboard merchantId={merchantId} />
        
        <div className="mt-8">
          <Card className="p-6" glassmorphism>
            <h2 className="text-xl font-semibold mb-6">Analytics Integration</h2>
            
            <div className="space-y-4">
              <p>
                You can integrate this analytics data into your own systems using our API.
                All data is available via the GraphQL API endpoint.
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`// Example: Fetch payment analytics
const response = await fetch('https://api.nexor.io/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${merchant?.apiKey || 'YOUR_API_KEY'}'
  },
  body: JSON.stringify({
    query: \`
      query GetPaymentAnalytics($merchantId: ID!, $startDate: String, $endDate: String) {
        paymentAnalytics(merchantId: $merchantId, startDate: $startDate, endDate: $endDate) {
          totalPayments
          totalVolumeUsd
          successRate
          averagePaymentAmount
          paymentsByToken {
            token
            count
            volumeUsd
          }
          paymentsByDay {
            date
            count
            volumeUsd
          }
        }
      }
    \`,
    variables: {
      merchantId: '${merchantId}',
      startDate: '2023-01-01',
      endDate: '2023-12-31'
    }
  })
});

const data = await response.json();
console.log(data.data.paymentAnalytics);`}
              </div>
              
              <p className="text-sm text-gray-400">
                Check our <a href="/docs/api" className="text-primary hover:underline">API documentation</a> for more details on available endpoints and parameters.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
