import { home, reserve } from '@mocaverse/feature-home-client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Providers } from './providers';

export function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          <Route path="/" element={<home.Page />} />
          <Route path="/reserve" element={<reserve.Page />} />
        </Routes>
      </Router>
    </Providers>
  );
}

export default App;
