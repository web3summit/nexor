import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { ExchangeRatesTable } from './ExchangeRatesTable';

interface AnalyticsData {
  totalPayments: number;
  totalVolumeUsd: number;
  successRate: number;
  averagePaymentAmount: number;
  paymentsByToken: {
    token: string;
    count: number;
    volumeUsd: number;
  }[];
  paymentsByStatus: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    count: number;
  }[];
  paymentsByDay: {
    date: string;
    count: number;
    volumeUsd: number;
  }[];
}

interface AnalyticsDashboardProps {
  merchantId: string;
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  merchantId,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd' | 'all'>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would call a GraphQL query
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data
        const mockData = generateMockAnalytics(merchantId, dateRange);
        setAnalytics(mockData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [merchantId, dateRange]);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Get chart data for payments by day
  const getChartData = () => {
    if (!analytics) return [];
    
    // Get the last 7 days of data for the chart
    return analytics.paymentsByDay.slice(-7);
  };
  
  // Render chart bars
  const renderChartBars = () => {
    const chartData = getChartData();
    const maxVolume = Math.max(...chartData.map(day => day.volumeUsd));
    
    return chartData.map((day, index) => {
      const height = maxVolume > 0 ? (day.volumeUsd / maxVolume) * 100 : 0;
      
      return (
        <div key={day.date} className="flex flex-col items-center">
          <div className="relative w-8 mb-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="absolute bottom-0 w-full bg-primary bg-opacity-60 rounded-t-sm"
              style={{ minHeight: day.volumeUsd > 0 ? '4px' : '0' }}
            />
          </div>
          <div className="text-xs text-gray-400">
            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
          </div>
        </div>
      );
    });
  };
  
  if (loading) return <div className="h-64 flex items-center justify-center"><motion.div className="animate-spin h-8 w-8 text-primary" /></div>;
  if (error) return <div className="h-64 flex items-center justify-center">{error}</div>;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm">
          {(['7d', '30d', '90d', 'ytd', 'all'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'ghost'}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 text-sm ${
                dateRange === range ? '' : 'text-gray-400'
              }`}
              glassmorphism
            >
              {range === '7d' ? '7D' : 
               range === '30d' ? '30D' : 
               range === '90d' ? '90D' : 
               range === 'ytd' ? 'YTD' : 'All'}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6" glassmorphism>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(analytics?.totalVolumeUsd || 0)}
              </h3>
            </div>
            <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-6" glassmorphism>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Payments</p>
              <h3 className="text-2xl font-bold">
                {analytics?.totalPayments.toLocaleString() || 0}
              </h3>
            </div>
            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-6" glassmorphism>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <h3 className="text-2xl font-bold">
                {(analytics?.successRate || 0).toFixed(1)}%
              </h3>
            </div>
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-6" glassmorphism>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Average Payment</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(analytics?.averagePaymentAmount || 0)}
              </h3>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M10 7a1 1 0 011-1h.01a1 1 0 110 2H11a1 1 0 01-1-1zm1-3a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Chart */}
      <Card className="p-6" glassmorphism>
        <h2 className="text-xl font-semibold mb-6">Payment Volume</h2>
        
        <div className="h-64">
          <div className="flex items-end justify-between h-48 mb-4">
            {renderChartBars()}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Last 7 Days</span>
            <span>Total: {formatCurrency(getChartData().reduce((sum, day) => sum + day.volumeUsd, 0))}</span>
          </div>
        </div>
      </Card>
      
      {/* Payments by Token */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">Payments by Token</h2>
          
          {analytics?.paymentsByToken.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics?.paymentsByToken.map((tokenData, index) => {
                const percentage = analytics.totalVolumeUsd > 0
                  ? (tokenData.volumeUsd / analytics.totalVolumeUsd) * 100
                  : 0;
                
                return (
                  <div key={tokenData.token} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                          {tokenData.token.charAt(0)}
                        </div>
                        <span>{tokenData.token}</span>
                      </div>
                      <div className="text-sm">
                        {formatCurrency(tokenData.volumeUsd)} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-2 rounded-full bg-primary"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        
        {/* Payments by Status */}
        <Card className="p-6" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">Payments by Status</h2>
          
          {analytics?.paymentsByStatus.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {analytics?.paymentsByStatus.map((statusData, index) => {
                const percentage = analytics.totalPayments > 0
                  ? (statusData.count / analytics.totalPayments) * 100
                  : 0;
                
                // Get status color
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return 'bg-green-500';
                    case 'pending':
                      return 'bg-yellow-500';
                    case 'processing':
                      return 'bg-blue-500';
                    case 'failed':
                      return 'bg-red-500';
                    default:
                      return 'bg-gray-500';
                  }
                };
                
                return (
                  <div key={statusData.status} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 ${getStatusColor(statusData.status)} rounded-full mr-2`}></div>
                        <span className="capitalize">{statusData.status}</span>
                      </div>
                      <div className="text-sm">
                        {statusData.count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-2 rounded-full ${getStatusColor(statusData.status)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
      
      {/* Exchange Rates */}
      <ExchangeRatesTable />
    </div>
  );
};

// Helper function to generate mock analytics data
function generateMockAnalytics(merchantId: string, dateRange: string): AnalyticsData {
  // Generate dates based on range
  const endDate = new Date();
  let startDate: Date;
  
  switch (dateRange) {
    case '7d':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '90d':
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 90);
      break;
    case 'ytd':
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }
  
  // Generate daily data
  const dailyData: AnalyticsData['paymentsByDay'] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // More recent days have higher volume for a realistic trend
    const daysFromStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const factor = daysFromStart / totalDays;
    
    // Add some randomness but keep the trend
    const randomFactor = 0.5 + Math.random();
    const count = Math.floor(5 + (15 * factor * randomFactor));
    const volumeUsd = Math.floor(100 + (900 * factor * randomFactor));
    
    dailyData.push({
      date: currentDate.toISOString().split('T')[0],
      count,
      volumeUsd,
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate totals
  const totalPayments = dailyData.reduce((sum, day) => sum + day.count, 0);
  const totalVolumeUsd = dailyData.reduce((sum, day) => sum + day.volumeUsd, 0);
  const averagePaymentAmount = totalPayments > 0 ? totalVolumeUsd / totalPayments : 0;
  
  // Generate token data
  const tokens = ['DOT', 'KSM', 'SOL', 'USDT', 'USDC'];
  const paymentsByToken = tokens.map(token => {
    // Assign random distribution with DOT having highest volume
    const factor = token === 'DOT' ? 0.4 : 
                  token === 'KSM' ? 0.25 : 
                  token === 'USDC' ? 0.15 : 
                  token === 'USDT' ? 0.12 : 0.08;
    
    const volumeUsd = totalVolumeUsd * factor;
    const count = Math.floor(totalPayments * factor);
    
    return {
      token,
      count,
      volumeUsd,
    };
  });
  
  // Generate status data
  const paymentsByStatus = [
    { status: 'completed' as const, count: Math.floor(totalPayments * 0.85) },
    { status: 'pending' as const, count: Math.floor(totalPayments * 0.07) },
    { status: 'processing' as const, count: Math.floor(totalPayments * 0.05) },
    { status: 'failed' as const, count: Math.floor(totalPayments * 0.03) },
  ];
  
  // Calculate success rate
  const successRate = (paymentsByStatus.find(s => s.status === 'completed')?.count || 0) / totalPayments * 100;
  
  return {
    totalPayments,
    totalVolumeUsd,
    successRate,
    averagePaymentAmount,
    paymentsByToken,
    paymentsByStatus,
    paymentsByDay: dailyData,
  };
}
