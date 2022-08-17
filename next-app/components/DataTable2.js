import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';

import * as web3 from '@solana/web3.js';






export const DataTable2= (props) => {


  const { connection } = useConnection();
  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();


  const [rows, setRows] = useState([
   
  ]);


  const columns = [
    { field: 'nft', headerName: 'NFT', width: 500 },
    { field: 'owner', headerName: 'Owner', width: 500 },
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
      headerName: 'Amount (in SOL)',
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

            console.log(thisRow.owner);
            console.log(thisRow.amount);
            const topubkey = thisRow.owner;

          const tx = new web3.Transaction().add(web3.SystemProgram.transfer({fromPubkey: publicKey, toPubkey: thisRow.owner, lamports: thisRow.amount*web3.LAMPORTS_PER_SOL}));
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
          setRows([{ id:'1', nft: 'GyZvmjUdFQSRjixEvySFpViiLjzXuGX9T282BUfFzU7N', owner: 'KGE7DqaQXDN7hfhMshCgisNXzKD2GEZffc3YENNRdjQd', type_card:'SILVER', amount: 3, interest: 2 },
        ]);
        props.onChangeAL([{ id:'2', nft: '8ED7exrYJo3Bm8bpiUs67pEQHh8EbziMDZLFFqcMgsHT', owner: 'KMcyC5nELGSwnhRwmNmoE3Nx1HkXyJENSC44vDG3frg', type_card:'BRONZE', amount: 0.5, interest: 3.5 }],
        );
        
          return;

          
  
          
  /*
          api
            .getAllColumns()
            .filter((c) => c.field !== "__check__" && !!c)
            .forEach(
              (c) => (thisRow[c.field] = params.getValue(params.id, c.field))
            );
  
          return alert(JSON.stringify(thisRow, null, 4));*/
        };
  
        return <Button onClick={onClick}>Lend</Button>;
      }
    },
  ];


  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  );
}
