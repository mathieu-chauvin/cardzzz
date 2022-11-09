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

      //refresh data
      getPools();
    }

    async function withdrawPool(poolId) {

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
        ],
        programId,
        data: Buffer.from([1,poolId]), // create a random pool 
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

      //refresh data
      getPools();
    }

    async function handleInitPool() {
      await initPool(idPoolInit);
    }

    async function handleWithdrawPool() {
      await withdrawPool(idPoolWithdraw);
    }

    async function getPools() {
        //let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
         let pools = [];
          // for id from 0 to 10
            for (let poolId = 0; poolId < 10; poolId++) {
                // pool is a pda of the program id and the id
                //const pool = await web3.PublicKey.findProgramAddress([Buffer.from('pool'), Buffer.from([i])], programId);
                const [pool, bumpSeed] = await web3.PublicKey.findProgramAddress(
                    [Buffer.from('pool'), Buffer.from([poolId])],
                    programId
                );// get the account info of the pool
                const poolPkey = new web3.PublicKey(pool);
                const poolAccount = await connection.getAccountInfo(poolPkey);
                console.log(poolPkey.toBase58());
                // if the account info is not null
                if (poolAccount != null) {
                  console.log(poolAccount);
                  pools.push({
                    poolId: poolId,
                    lamports: poolAccount.lamports,
                  });
                }
            }         

          setRows(pools);
      }
    

    useEffect(() => {
      
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
                        <tr key={row.poolId}>
                            <td>{row.poolId}</td>
                            <td>{row.lamports/1000000000} SOL</td>
                        </tr>
                    ))}
                </tbody>
            </table>

           <input type="text" placeholder="ID" value={idPoolWithdraw} onChange={(event) => setIdPoolWithdraw(event.target.value)} />
           <button onClick={handleWithdrawPool}>Withdraw</button> 
      </div>
    );
};
