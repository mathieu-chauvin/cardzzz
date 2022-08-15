import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';

export const ShowNFTs = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();
    const nft = props.nft;

    const onClick = async () => {

        console.log("looking for nft");
        let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        if(!myNfts.length) {
          props.onNftChange(null);
          return;
        }
        let randIdx = Math.floor(Math.random() * myNfts.length);
        await myNfts[randIdx].metadataTask.run();
        props.onNftChange(myNfts[randIdx]);
    };

    return wallet.connected && (
      <div>
        <div>
          <div className={styles.container}>
            <h1 className={styles.title}>NFT Mint Address</h1>
            <div className={styles.nftForm}>
              <input
                type="text"
                value={nft ? nft.mint.toBase58() : ""}
                readOnly
              />
            <button onClick={onClick}>Pick NFT</button>
            </div>
            {nft && (
              <div className={styles.nftPreview}>
                <h1>{nft.name}</h1>
                <img
                  src={nft.metadata.image || '/fallbackImage.jpg'}
                  alt="The downloaded illustration of the provided NFT address."
                />
                <p>Interest rate : 0%</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};
