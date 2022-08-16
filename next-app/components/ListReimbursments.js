import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTableR } from './DataTableR';
import * as spl from "@solana/spl-token";

export const ListReimbursments = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    

    


    return wallet.connected && (
      <div>
        
            <h3>Loans to repay</h3>
             <DataTableR />
            
      </div>
    );
};
