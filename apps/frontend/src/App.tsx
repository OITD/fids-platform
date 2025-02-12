import { useState, useEffect } from 'react';
import { isBlank } from '@fids-platform/common';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Client, { Local } from './lib/client';
import Dashboard from '~/pages/dashboard.tsx';

function App() {
  return <Dashboard />;
}

export default App;
