import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import * as web3 from "@solana/web3.js";
import { DataTableR } from './DataTableR';
import * as spl from "@solana/spl-token";
import { BN } from 'bn.js';

export const ListReimbursments = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const { connection } = useConnection();

    const [rowsAL, setRowsAL] = useState([]);
    const programId = new web3.PublicKey('FjJHbCgdMKSe5K6Xp9iksjJeWCdvz6KLbDN5xUE67RUm');

    const [rows, setRows] = useState([]);

    function deserializeOffer(data) {
      const is_initialized_dst = data.slice(0, 1);
      const initializer_pubkey_dst = data.slice(1, 33);
      const temp_token_account_pubkey_dst = data.slice(33, 65);
      const expected_amount_dst = data.slice(65, 73);
      const offer = {
        is_initialized_dst: is_initialized_dst,
        initializer_pubkey_dst: initializer_pubkey_dst,
        temp_token_account_pubkey_dst: temp_token_account_pubkey_dst,
        expected_amount_dst: expected_amount_dst
      };
      return offer;
    }
    
    
    useEffect(() => {
      async function getOffers() {
        //let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        
          const programAccounts = await connection.getProgramAccounts(programId);
          console.log(programAccounts);

          let offers = [];
          let id = 0;

          programAccounts.forEach(async (programAccount) => {
              const offer = deserializeOffer(programAccount.account.data);

              //TODO : adapt to other types of cards and interest
              offers.push({id:id,
                address:programAccount.pubkey.toBase58(), 
                nft:new web3.PublicKey(offer.temp_token_account_pubkey_dst).toBase58(), 
                owner:new web3.PublicKey(offer.initializer_pubkey_dst).toBase58(), 
                amount:new BN(offer.expected_amount_dst, 'le').toString(),
                type_card:'BRONZE',
                interest:2
              });
              id++;

              
          });

          setRows(offers);
  
          //programAccounts.forEach(async (programAccount) => {
      } 
      getOffers();
        
    },[]);
    
    
    



    


    return wallet.connected && (
      <div>
        
            <h3>Loans to repay</h3>
            {rows.length? <DataTableR rows={rows} onChangeAL={(rows) => setRows(rows)} />: null }
            
      </div>
    );
};
