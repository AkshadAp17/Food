import { useState, useEffect } from 'react';

export function TestPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log('TestPage: Component mounted');
    
    const testAPI = async () => {
      try {
        console.log('TestPage: Starting API test...');
        
        const response = await fetch('/api/restaurants');
        console.log('TestPage: Response status:', response.status);
        console.log('TestPage: Response headers:', Object.fromEntries(response.headers));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('TestPage: Received data:', result);
        setData(result);
      } catch (err) {
        console.error('TestPage: Error occurred:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>API Test Page</h1>
      
      {error ? (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      ) : data ? (
        <div style={{ color: 'green', padding: '10px', border: '1px solid green' }}>
          <h3>Success! Restaurants found: {Array.isArray(data) ? data.length : 'Invalid data'}</h3>
          <details>
            <summary>View Raw Data</summary>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div style={{ color: 'blue', padding: '10px', border: '1px solid blue' }}>
          <h3>Loading...</h3>
        </div>
      )}
      
      <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
        <h3>Debug Info:</h3>
        <p>Current URL: {window.location.href}</p>
        <p>Base URL for API: {new URL('/api/restaurants', window.location.origin).href}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}