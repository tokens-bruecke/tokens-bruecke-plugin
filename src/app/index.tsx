import React from 'react';
import { createRoot } from 'react-dom/client';

import Container from './container';
import 'react-figma-ui/ui/styles.css';

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('react-page');
  const root = createRoot(container!);
  root.render(<Container />);
});
