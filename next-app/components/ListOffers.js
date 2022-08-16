import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import { DataTable } from './DataTable';
import { DataTable2 } from './DataTable2';
import * as spl from "@solana/spl-token";

export const ListOffers = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();

    const [rowsAL, setRowsAL] = useState([]);




    const rows2 = [
      { id:'1', nft: 'GyZvmjUdFQSRjixEvySFpViiLjzXuGX9T282BUfFzU7N', owner: 'KGE7DqaQXDN7hfhMshCgisNXzKD2GEZffc3YENNRdjQd', type_card:'SILVER', amount: 3, interest: 2 },
      { id:'2', nft: '8ED7exrYJo3Bm8bpiUs67pEQHh8EbziMDZLFFqcMgsHT', owner: 'KMcyC5nELGSwnhRwmNmoE3Nx1HkXyJENSC44vDG3frg', type_card:'BRONZE', amount: 0.5, interest: 3.5 },
      
    ];



    return wallet.connected && (
      <div>
        
            <h3>Active loans</h3>
            {rowsAL.length? <DataTable rows={rowsAL}/>: <p>No active loans</p>}
              <h3>New possible loans</h3>
              {rows2.length? <DataTable2 onChangeAL={(rowsA) => setRowsAL(rowsA)} />: null }
            
      </div>
    );
};
