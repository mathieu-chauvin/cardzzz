import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTable } from './DataTable';
import * as spl from "@solana/spl-token";

export const ListOffers = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const rows = [
    ];

    const rows2 = [
      { id:'1', nft: 'hello this my nft', owner: 'Snow', amount: 0.1, interest: 3.5 },
      { id:'2', nft: '2', owner: 'Snow', amount: 0.1, interest: 3.5 },
      { id:'3', nft: '3', owner: 'Snow', amount: 0.1, interest: 3.5 },
      { id:'4', nft: '4', owner: 'Snow', amount: 0.1, interest: 3.5 },
    ];



    return wallet.connected && (
      <div>
        
            <h3>Active loans</h3>
            {rows.length? <DataTable rows={rows}/>: <p>No active loans</p>}
              <h3>New possible loans</h3>
              {rows2.length? <DataTable rows={rows2}/>: null }
            
      </div>
    );
};
