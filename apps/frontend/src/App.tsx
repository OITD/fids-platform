import { useState, useEffect } from 'react';
import { isBlank } from '@fids-platform/common';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Client, { Local } from './lib/client';

function App() {
  const [count, setCount] = useState(0);
  const [greeting, setGreeting] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create a new client instance using the Local endpoint
    const client = new Client(Local);

    // Make the API call when component mounts
    const fetchGreeting = async () => {
      try {
        const response = await client.hello.get('Frontend User');
        setGreeting(response.message);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch greeting');
      }
    };

    fetchGreeting();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      {/* Display the greeting from the API */}
      {greeting && (
        <div className="greeting">
          <h2>{greeting}</h2>
        </div>
      )}

      {/* Display any errors */}
      {error && (
        <div className="error" style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      <div>
        <p>undefined isBlank - {isBlank(undefined) ? 'true' : 'false'}</p>
        <p>false isBlank - {isBlank(false) ? 'true' : 'false'}</p>
        <p>true isBlank - {isBlank(true) ? 'true' : 'false'}</p>
        <p>Empty object isBlank - {isBlank({}) ? 'true' : 'false'}</p>
      </div>
    </>
  );
}

export default App;
