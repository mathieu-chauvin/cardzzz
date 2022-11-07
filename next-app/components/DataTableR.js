import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';

import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';

import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';






export const DataTableR= (props) => {


  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

  
  const programId = new web3.PublicKey('FjJHbCgdMKSe5K6Xp9iksjJeWCdvz6KLbDN5xUE67RUm');

  const columns = [
    { field: 'nft', headerName: 'NFT', width: 500 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'lender', headerName: 'Lender', width: 500 },
    {
      field: 'type_card',
      headerName: 'Type of card',
      width: 150,
    },
    {
      field: 'interest',
      headerName: 'Interest',
      type: 'number',
      width: 150,
    },
    {
      field: 'amount',
      headerName: 'Amount (in SOL) with interest',
      type: 'number',
      width: 150,
    },
    
    {
      field: "action",
      headerName: "Action",
      width:300,
      sortable: false,
      renderCell: (params) => {
        const onClick = async (e) => {
          e.stopPropagation(); // don't select this row after clicking
  
          const api = params.api;
          const thisRow = {};

          api
            .getAllColumns()
            .filter((c) => c.field !== "__check__" && !!c)
            .forEach(
              (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
            );

            console.log(thisRow.lender);
            console.log(thisRow.amount);

          const tx = getRepayTx(thisRow);
          let signature = '';
          
          try {
            const transaction = tx;

              //const signed = await signTransaction(tx);
              //console.log('signed');

              signature = await sendTransaction(tx, connection);
              // now sign with the tokenAccount

              

              console.log('info', 'Transaction sent:', signature);

              await connection.confirmTransaction(signature, 'processed');
              console.log('success', 'Transaction successful!', signature);
          } catch (error) {
              console.log('error', `Transaction failed! ${error?.message}`, signature);
              return;
          }

          setRows([]);
  
          return alert('Success');

          
  
          
        };
  
        return <Button onClick={onClick}>Repay</Button>;
      }
    },
  ];

  async function getRepayTx (row){
      console.log("repay");
      const escrowPubkey = new web3.PublicKey(row.address);
      const tempXTokenAccount =  await getAccount(connection,new web3.PublicKey(row.nft));
      const mint = tempXTokenAccount.mint;
      const associatedSourceTokenAddr = await getAssociatedTokenAddress(mint,publicKey);
      
      const pda_account = await web3.PublicKey.findProgramAddress([Buffer.from("loan")], programId);
        console.log('pda_account', pda_account[0].toBase58());
        console.log('source', associatedSourceTokenAddr.toBase58());


        const paybackIx = new web3.TransactionInstruction({
          programId: programId,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            {
              pubkey: tempXTokenAccount.address,
              isSigner: false,
              isWritable: true,
            },
            { pubkey: associatedSourceTokenAddr, isSigner: false, isWritable: true },
            { pubkey: escrowPubkey, isSigner: false, isWritable: true },
            { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: spl.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: pda_account[0], isSigner: false, isWritable: false },
          ],
          data: Buffer.from(
            Uint8Array.of(2)
          ),
       });

        const tx = new web3.Transaction().add(
          paybackIx
        );

        tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        tx.feePayer = publicKey;
        return tx;

    }
    
    

  return (
    <div style={{ height: 400, width: '100%' }}>
      <p>Repay your loan to get your nft credit card back (with a better score than before).</p>
      {props.rows.length ?
      <DataGrid
        rows={props.rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />: <p>No loans to repay</p>}
    </div>
  );
}
