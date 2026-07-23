import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { initializeFirebaseAnalytics } from './services/firebase';
import './styles/base.css';
import './styles/feed.css';
import './styles/feed-card-system.css';
import './styles/carousel.css';
import './styles/engagement.css';
import './styles/detail.css';
import './styles/course.css';
import './styles/course-selector.css';
import './styles/course-feed.css';
import './styles/comments.css';
import './styles/forms.css';
import './styles/upload.css';
import './styles/admin.css';
import './styles/admin-dashboard.css';
import './styles/admin-content.css';
import './styles/auth.css';
import './styles/motion.css';
import './styles/responsive.css';

void initializeFirebaseAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
