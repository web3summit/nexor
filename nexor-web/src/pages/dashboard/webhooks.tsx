import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { useAnalytics } from '../../hooks/useAnalytics';

interface WebhookEvent {
  id: string;
  type: string;
  createdAt: string;
  status: 'delivered' | 'failed' | 'pending';
  payload: Record<string, any>;
  response?: {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  };
  attempts: number;
  nextRetry?: string;
}

export default function WebhooksPage() {
  const merchantId = 'merch_123456'; // Mock merchant ID for development
  const { trackPageView } = useAnalytics(merchantId);
  
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [filter, setFilter] = useState<'all' | 'delivered' | 'failed' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track page view
  useEffect(() => {
    trackPageView('webhooks_page');
  }, [trackPageView]);
  
  // Fetch webhook events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would call our GraphQL API
        // For now, we'll simulate a response with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock webhook events
        const mockEvents: WebhookEvent[] = Array.from({ length: 20 }).map((_, index) => {
          const eventTypes = [
            'payment.created', 
            'payment.completed', 
            'payment.failed',
            'invoice.created',
            'invoice.paid',
            'invoice.expired'
          ];
          
          const statuses: ('delivered' | 'failed' | 'pending')[] = ['delivered', 'failed', 'pending'];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          const date = new Date();
          date.setHours(date.getHours() - index);
          
          return {
            id: `whevt_${Math.random().toString(36).substring(2, 10)}`,
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            createdAt: date.toISOString(),
            status,
            payload: {
              event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
              data: {
                id: `pay_${Math.random().toString(36).substring(2, 10)}`,
                amount: (Math.random() * 1000).toFixed(2),
                currency: 'USD',
                status: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
              }
            },
            response: status !== 'pending' ? {
              statusCode: status === 'delivered' ? 200 : 500,
              body: status === 'delivered' ? '{"success":true}' : '{"error":"Internal Server Error"}',
              headers: {
                'content-type': 'application/json',
                'user-agent': 'Nexor-Webhook/1.0'
              }
            } : undefined,
            attempts: status === 'delivered' ? 1 : status === 'failed' ? Math.floor(Math.random() * 3) + 1 : 0,
            nextRetry: status === 'failed' ? new Date(Date.now() + 1000 * 60 * 30).toISOString() : undefined
          };
        });
        
        setEvents(mockEvents);
      } catch (err) {
        console.error('Error fetching webhook events:', err);
        setError('Failed to load webhook events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Handle retry webhook
  const handleRetryWebhook = async (eventId: string) => {
    try {
      // In a real implementation, we would call our GraphQL API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state to simulate success
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, status: 'delivered', attempts: event.attempts + 1, nextRetry: undefined } 
            : event
        )
      );
      
      // If this is the selected event, update it too
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(prev => 
          prev ? { ...prev, status: 'delivered', attempts: prev.attempts + 1, nextRetry: undefined } : null
        );
      }
    } catch (err) {
      console.error('Error retrying webhook:', err);
      alert('Failed to retry webhook. Please try again.');
    }
  };
  
  // Filter events
  const filteredEvents = events.filter(event => {
    // Apply status filter
    if (filter !== 'all' && event.status !== filter) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.id.toLowerCase().includes(searchLower) ||
        event.type.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.payload).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status badge color
  const getStatusColor = (status: 'delivered' | 'failed' | 'pending') => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'failed':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Webhook Events</h1>
            <p className="text-gray-300">Monitor and debug your webhook deliveries</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
            >
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6" glassmorphism>
              <div className="flex flex-col space-y-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full pl-10 pr-4 py-2 sm:text-sm border-gray-700 rounded-md"
                    placeholder="Search webhook events"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Status Filter */}
                <div className="flex space-x-2">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    glassmorphism={filter === 'all'}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'delivered' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('delivered')}
                    glassmorphism={filter === 'delivered'}
                  >
                    Delivered
                  </Button>
                  <Button
                    variant={filter === 'failed' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('failed')}
                    glassmorphism={filter === 'failed'}
                  >
                    Failed
                  </Button>
                  <Button
                    variant={filter === 'pending' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('pending')}
                    glassmorphism={filter === 'pending'}
                  >
                    Pending
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-0 overflow-hidden" glassmorphism>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : error ? (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 m-4">
                  <p className="text-red-300">{error}</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-300">No webhook events found</h3>
                  <p className="text-gray-400 mt-1">
                    {searchTerm || filter !== 'all'
                      ? 'Try changing your search or filter criteria'
                      : 'No webhook events have been sent yet'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-700">
                  {filteredEvents.map((event) => (
                    <motion.li
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`hover:bg-gray-800 hover:bg-opacity-30 transition-colors cursor-pointer ${
                        selectedEvent?.id === event.id ? 'bg-purple-900 bg-opacity-30' : ''
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="px-4 py-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {event.type}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(event.createdAt)}
                            </p>
                          </div>
                          <div className="ml-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-mono text-gray-400 truncate">
                            {event.id}
                          </p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
          
          {/* Event Details */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <Card className="p-6" glassmorphism>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedEvent.type}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {formatDate(selectedEvent.createdAt)}
                    </p>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Event ID</h3>
                    <p className="font-mono text-sm">{selectedEvent.id}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Attempts</h3>
                    <p>{selectedEvent.attempts}</p>
                  </div>
                  
                  {selectedEvent.nextRetry && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Next Retry</h3>
                      <p>{formatDate(selectedEvent.nextRetry)}</p>
                    </div>
                  )}
                </div>
                
                {/* Payload */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Payload</h3>
                  <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      {JSON.stringify(selectedEvent.payload, null, 2)}
                    </pre>
                  </div>
                </div>
                
                {/* Response */}
                {selectedEvent.response && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Response</h3>
                    <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 overflow-x-auto">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-mono">
                          Status: <span className={selectedEvent.response.statusCode >= 200 && selectedEvent.response.statusCode < 300 ? 'text-green-400' : 'text-red-400'}>
                            {selectedEvent.response.statusCode}
                          </span>
                        </span>
                      </div>
                      <pre className="text-sm font-mono text-gray-300">
                        {selectedEvent.response.body}
                      </pre>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-end">
                  {selectedEvent.status === 'failed' && (
                    <Button
                      onClick={() => handleRetryWebhook(selectedEvent.id)}
                      glassmorphism
                      leftIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      }
                    >
                      Retry Webhook
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6 flex flex-col items-center justify-center h-full" glassmorphism>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">Select a webhook event</h3>
                <p className="text-gray-400 text-center">
                  Choose a webhook event from the list to view its details
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
