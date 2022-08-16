import styles from '../styles/Home.module.css'
import { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { MetaplexProvider } from '../components/MetaplexProvider';
import '@solana/wallet-adapter-react-ui/styles.css';

import { Tabs } from '../components/Tabs';


export default function Home() {

  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);

  


  const endpoint = useMemo(() => clusterApiUrl(network), [network]);



  const wallets = useMemo(
      () => [
          new PhantomWalletAdapter(),
          new GlowWalletAdapter(),
          new SlopeWalletAdapter(),
          new SolflareWalletAdapter({ network }),
          new TorusWalletAdapter(),
      ],
      [network]
  );

  const handleChange = (event) => {
    console.log("hello");
    switch(event.target.value){
      case "devnet":
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
      case "mainnet":
        setNetwork(WalletAdapterNetwork.Mainnet);
      break;
      case "testnet":
        setNetwork(WalletAdapterNetwork.Testnet);
        break;
      default:
        setNetwork(WalletAdapterNetwork.Devnet);
        break;
    }
  };


  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        
        <WalletModalProvider>
        <MetaplexProvider>
          <div className={styles.App}>
            <h1>Solana credit cards</h1>
           
            <WalletMultiButton />
            <select onChange={handleChange} className={styles.dropdown}>
              <option value="devnet">Devnet</option>
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
            </select>
            <Tabs/>
            
          </div>
        </MetaplexProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </div>
  );


}

