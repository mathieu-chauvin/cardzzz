import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTable } from './DataTable';
import * as spl from "@solana/spl-token";

export const ListReimbursments = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const rows = [
    ];

    


    return wallet.connected && (
      <div>
        
            <h3>Active loans</h3>
            {rows.length? <DataTable rows={rows}/>: <p>No active loans</p>}
            
      </div>
    );
};
