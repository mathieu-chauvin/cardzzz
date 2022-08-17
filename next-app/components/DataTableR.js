import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';

import * as web3 from '@solana/web3.js';






export const DataTableR= (props) => {


  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

  const [rows, setRows] = useState([]);



  const columns = [
    { field: 'nft', headerName: 'NFT', width: 500 },
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

          const tx = new web3.Transaction().add(web3.SystemProgram.transfer({fromPubkey: publicKey, toPubkey: thisRow.lender, lamports: thisRow.amount*web3.LAMPORTS_PER_SOL}));
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

          
  
          
  /*
          api
            .getAllColumns()
            .filter((c) => c.field !== "__check__" && !!c)
            .forEach(
              (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
            );
  
          return alert(JSON.stringify(thisRow, null, 4));*/
        };
  
        return <Button onClick={onClick}>Repay</Button>;
      }
    },
  ];


  return (
    <div style={{ height: 400, width: '100%' }}>
      <p>Repay your loan to get your nft credit card back (with a better score than before).</p>
      {rows.length ?
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />: <p>No loans to repay</p>}
    </div>
  );
}
