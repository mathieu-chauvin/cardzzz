import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState, useEffect } from "react";
import { useWallet } from '@solana/wallet-adapter-react';


import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export const ShowNFTs = (props) => {
    const { metaplex } = useMetaplex();
    const {publicKey, connected} = useWallet();
    const nft = props.nft;
    const [nftList, setNftList] = useState([]);
    const creatorKey = 'KMcyC5nELGSwnhRwmNmoE3Nx1HkXyJENSC44vDG3frg';


    useEffect(() => {
      async function getTokens() {
        //let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        console.log(metaplex.identity().publicKey);
        console.log(publicKey);
        if (publicKey != null){
          let myNfts = await metaplex.nfts().findAllByOwner(publicKey);
          myNfts.filter(nft => nft.updateAuthority.toBase58() === creatorKey);
          setNftList(myNfts);
        }
        
      }
      getTokens();
      

      
    },[]);

    const onClick = async () => {

        console.log("looking for nft");
        
        if(!myNfts.length) {
          props.onNftChange(null);
          return;
        }
        let randIdx = Math.floor(Math.random() * myNfts.length);
        await myNfts[randIdx].metadataTask.run();
        props.onNftChange(myNfts[randIdx]);
    };

    const handleChange = async (event) => {
      const nftpremeta = (event.target.value);
      await nftpremeta.metadataTask.run();
      props.onNftChange(nftpremeta);
    }

    const createSelectItems = () => {
      let items = []; 
      let maxValue = nftList.length;        
      console.log("maxValue: " + maxValue);
      console.log("nftList: " + nftList);

      console.log(nftList[0]);
      for (let i = 0; i < maxValue; i++) {             
          let score = 0;
          //scoreV = (score+50);
          if (nftList[i].name == 'SolCredit cards'){
            items.push(<MenuItem value={nftList[i]}>{nftList[i].name}, Bronze (Score : {score})</MenuItem>);
          }
           //<option key={i} value={i}>{i}</option>);   
           //here I will be creating my options dynamically based on
           //what props are currently passed to the parent component
      }
      return items;
    }
/*
<div className={styles.nftForm}>
              <input
                type="text"
                value={nft ? nft.mint.toBase58() : ""}
                readOnly
              />
            <button onClick={onClick}>Pick NFT</button>
            </div>
            */

    return connected && (
      <div>
        <div>
          <div className={styles.container}>
            <h1 className={styles.title}>NFT Mint Address = {nft!= null && nft.mint.toBase58()}</h1>

  
            <Box sx={{ minWidth: 120 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Credit card</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={nft}
                  label="NFTs"
                  onChange={handleChange}
                >
                  {createSelectItems()}
                </Select>
              </FormControl>
            </Box>


            
            {nft && (
              <div className={styles.nftPreview}>
                
                <img
                  src={nft.metadata.image || '/fallbackImage.jpg'}
                  alt="The downloaded illustration of the provided NFT address."
                  style={{ maxWidth: '70%' }}
                />
                <p>Max borrowing limit : 0.5 sol      <br/>         Interest rate : 3.5% per month</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};
