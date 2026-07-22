import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App';
import './styles/base.css';
import './styles/feed.css';
import './styles/carousel.css';
import './styles/engagement.css';
import './styles/detail.css';
import './styles/course.css';
import './styles/forms.css';
import './styles/admin.css';
import './styles/auth.css';
import './styles/responsive.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
