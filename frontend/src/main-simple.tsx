import React from 'react';
import { createRoot } from 'react-dom/client';
import MinimalApp from './MinimalApp';

const root = createRoot(document.getElementById('root'));
root.render(<MinimalApp />);
