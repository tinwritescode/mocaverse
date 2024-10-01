import { Home } from '@mocaverse/feature-home-client';
import { Toaster } from '@mocaverse/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider } from 'connectkit';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import ReservePage from '../../../../libs/feature-home/client/src/lib/ReservePage';
import { config } from './config/wagmi';

const queryClient = new QueryClient();

export function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <Toaster />

          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reserve" element={<ReservePage />} />
            </Routes>
          </Router>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
