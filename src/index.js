import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './contexts/ThemeContext';
import { DateRangeProvider } from "./contexts/DateRangeContext";
import { ViewModeProvider } from "./contexts/ViewModeContext";

import "antd/dist/reset.css";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <DateRangeProvider>
        <ViewModeProvider>
          <App />
        </ViewModeProvider>
       
      </DateRangeProvider>  
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();