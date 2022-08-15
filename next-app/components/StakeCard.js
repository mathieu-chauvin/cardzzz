import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import * as spl from "@solana/spl-token";

export const StakeCard = (props) => {
    const { metaplex } = useMetaplex();
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

    const connectionC = new web3.Connection('https://api.devnet.solana.com')
    const nft = props.nft;
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(0);

    const [staked, setStaked] = useState(false);




    const onClick = async () => {
        if (!staked) {
          await stakeNFT();
        }
        else {
          await unstakeNFT();
        }
    };

   
    const handleChangeAmount = (event) => {
      setAmount(event.target.value);
    }
    const handleChangeDate = (event) => {
      setDate(event.target.value);
    }

    const unstakeNFT = async () => {
    }

    const stakeNFT = async () => {
        /*let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        if(!myNfts.length) {
            setNft(null);
            return;
        }
        wallet.sendTransaction(web3.Instruction.createAccount(myNfts[0].mint, myNfts[0].mint, 100));*/


        //create an associated account for the NFT owned by the program

        const tempXTokenAccountKeypair = new web3.Keypair();

        const borrower_token_account_pubkey = nft.address;

        const XTokenMintPubkey = nft.mint;
        console.log(XTokenMintPubkey);

        console.log("construct transaction");

        

        const createTempTokenAccountIx = web3.SystemProgram.createAccount({
              programId: spl.TOKEN_PROGRAM_ID,
              space: spl.AccountLayout.span,
              lamports: await connection.getMinimumBalanceForRentExemption(
                spl.AccountLayout.span
              ),
              fromPubkey: publicKey,
              newAccountPubkey: tempXTokenAccountKeypair.publicKey,
        });

        console.log(nft.mint);
        
        const initTempAccountIx = spl.createInitializeAccountInstruction(

            tempXTokenAccountKeypair.publicKey,
            XTokenMintPubkey,
            publicKey,
            spl.TOKEN_PROGRAM_ID
            
        );

        const transferXTokensToTempAccIx = spl.createTransferInstruction(
            
            borrower_token_account_pubkey,
            tempXTokenAccountKeypair.publicKey,
            publicKey,
            1,
            [],
            spl.TOKEN_PROGRAM_ID,
        );

        const tx = new web3.Transaction().add(
          createTempTokenAccountIx,
          initTempAccountIx,
          transferXTokensToTempAccIx
        );
        
        console.log(connection);
        tx.recentBlockhash= await (await connection.getLatestBlockhash('finalized')).blockhash; 
        tx.feePayer = publicKey;

        //tx.sign(tempXTokenAccountKeypair);

        console.log(tx.recentBlockhash);
        console.log("Sending Alice's transaction...");

        let signature = '';
        try {
            const transaction = tx;
            const transactionT = new web3.Transaction();

            const signed = await signTransaction(tx);
            console.log('signed');
            // now sign with the tokenAccount
            signed.partialSign(tempXTokenAccountKeypair);

            signature = await sendTransaction(transaction, connection);
            

            console.log('info', 'Transaction sent:', signature);

            //await connection.confirmTransaction(signature, 'processed');
            console.log('success', 'Transaction successful!', signature);
        } catch (error) {
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }

        console.log("finished stake NFT");
          
        //await wallet.signTransaction(tx);

        /*await wallet.sendTransaction(
          tx,
          connection.connection
        );*/
        //[wallet.publicKey, tempXTokenAccountKeypair.publicKey]

        //spl.transfer(connection, wallet.publicKey,wallet.publicKey, pda, wallet.publicKey, 1)
        //web3.SystemProgram.transfer({fromPubkey:alice.publicKey, toPubkey:chest_a_b[0], lamports:web3.LAMPORTS_PER_SOL})
    
      
        //const instr = web3.Instruction.createAccount(myNfts[0].mint, myNfts[0].mint, 100);



    };


    return connected && (
      <div>
        
        <div>
          <div className={styles.container}>
            <h1 className={styles.title}>NFT Stake program</h1>
            <div className={styles.nftForm}>
            <h3 className={styles.title}>NFT address</h3>
              <input
                type="text"
                value={nft ? nft.mint.toBase58() : ""}
                
              />
              <h3 className={styles.title}>Amount</h3>
              <input
                type="text"
                value={amount}
                onChange={handleChangeAmount}
                
              />

            <h3 className={styles.title}>Date</h3>
              <input
                type="text"
                value={date}
                onChange={handleChangeDate}
                
              />

            <button onClick={onClick}>Stake Card & Ask for loan</button>
            </div>
            
          </div>
        </div>
      </div>
    );
};
