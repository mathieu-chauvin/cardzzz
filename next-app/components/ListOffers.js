import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTable } from './DataTable';
import { DataTable2 } from './DataTable2';
import * as spl from "@solana/spl-token";
import { BN } from 'bn.js';

export const ListOffers = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const { connection } = useConnection();

    const [rowsAL, setRowsAL] = useState([]);
    const programId = new web3.PublicKey('7yo7fcTxAyAtF3PsoRmeXWeoNtUD5m9qykZ5jhWqtPbR');

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




    const rows2 = [
      { id:'1', nft: 'GyZvmjUdFQSRjixEvySFpViiLjzXuGX9T282BUfFzU7N', owner: 'KGE7DqaQXDN7hfhMshCgisNXzKD2GEZffc3YENNRdjQd', type_card:'SILVER', amount: 3, interest: 2 },
      { id:'2', nft: '8ED7exrYJo3Bm8bpiUs67pEQHh8EbziMDZLFFqcMgsHT', owner: 'KMcyC5nELGSwnhRwmNmoE3Nx1HkXyJENSC44vDG3frg', type_card:'BRONZE', amount: 0.5, interest: 3.5 },
      
    ];



    return wallet.connected && (
      <div>
        
            <h3>Active loans</h3>
            {rowsAL.length? <DataTable rows={rowsAL}/>: <p>No active loans</p>}
              <h3>New possible loans</h3>
              {rows2.length? <DataTable2 rows={rows} onChangeAL={(rowsA) => setRowsAL(rowsA)} />: null }
            
      </div>
    );
};
