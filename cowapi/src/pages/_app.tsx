import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import {
  createConfig,
  WagmiProvider,
} from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { arbitrum } from 'viem/chains';

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/94952/fund-manager/version/latest',
  cache: new InMemoryCache(),
});

const config = createConfig({
  chains: [arbitrum],
  multiInjectedProviderDiscovery: false,
  transports: {
    [arbitrum.id]: http(),
  },
});
  
const queryClient = new QueryClient();
  
export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "ebd689fa-ead2-4b0c-af76-07c53ca631c2",
        
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ApolloProvider client={client}>
            <DynamicWagmiConnector>
              <DynamicWidget />
              <ToastContainer />
              <Component {...pageProps} />
            </DynamicWagmiConnector>
          </ApolloProvider>
        </QueryClientProvider>
      </WagmiProvider> 
    </DynamicContextProvider>
  );
};