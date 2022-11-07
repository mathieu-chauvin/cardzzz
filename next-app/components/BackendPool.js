import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTable } from './DataTable';
import { DataTable2 } from './DataTable2';
import * as spl from "@solana/spl-token";
import { BN } from 'bn.js';

export const BackendPool = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const { connection } = useConnection();

    const programId = new web3.PublicKey('FjJHbCgdMKSe5K6Xp9iksjJeWCdvz6KLbDN5xUE67RUm');

    const [rows, setRows] = useState([]);
    const [idPoolInit, setIdPoolInit] = useState(0);
    const [idPoolWithdraw, setIdPoolWithdraw] = useState(0);
    
   
    async function initPool(poolId) {
      
      //get pda for pool account from poolId
      const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
        [Buffer.from('pool'), Buffer.from([poolId])],
        programId
      );

      // call program init pool instyuction
      const pool_init_ix = new web3.TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: poolAccount, isSigner: false, isWritable: true },
          { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          // system info account
          { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from([4,poolId]), // create a random pool 
      });
     
      const blockhash = await connection.getLatestBlockhash();
      const tx = new web3.Transaction().add(pool_init_ix);
      tx.recentBlockhash = blockhash.blockhash;
      tx.feePayer = wallet.publicKey;
      
      const signed = await wallet.signTransaction(tx);
      const txid = await connection.sendRawTransaction(signed.serialize());
      const transactionConfirmationConfig = {
        skipPreflight: false,
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      };
      await connection.confirmTransaction(txid, transactionConfirmationConfig);
      console.log('Pool created', txid);

    }

    async function withdrawPool(poolId) {
    }

    async function handleInitPool() {
      await initPool(idPoolInit);
    }

    async function handleWithdrawPool() {
      await withdrawPool(idPoolWithdraw);
    }

    async function getPools() {
        //let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        
          const programAccounts = await connection.getProgramAccounts(programId);
          console.log(programAccounts);

          let offers = [];
          let id = 0;

          programAccounts.forEach(async (programAccount) => {
              
          });

          setRows(offers);
  
          //programAccounts.forEach(async (programAccount) => {
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
      getPools(); 
        
    },[]);



    return wallet.connected && (
      <div>
        
           <input type="text" placeholder="ID" value={idPoolInit} onChange={(event) => setIdPoolInit(event.target.value)} />
           <button onClick={handleInitPool}>Init</button> 

            <h4>Pool status</h4>
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            <td>{row.id}</td>
                            <td>{row.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

           <input type="text" placeholder="ID" value={idPoolWithdraw} onChange={(event) => setIdPoolWithdraw(event.target.value)} />
           <button onClick={handleWithdrawPool}>Withdraw</button> 
      </div>
    );
};
