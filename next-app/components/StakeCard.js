import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { TokenAccountNotFoundError } from '@solana/spl-token';

export const StakeCard = (props) => {
    const { metaplex } = useMetaplex();
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

    const BN = require('bn.js');


    const nft = props.nft;
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(0);

    const [staked, setStaked] = useState(false);

    const programId = new web3.PublicKey('7yo7fcTxAyAtF3PsoRmeXWeoNtUD5m9qykZ5jhWqtPbR');




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
        console.log(nft);
        console.log(nft.mint);
        
        const initTempAccountIx = spl.createInitializeAccountInstruction(

            tempXTokenAccountKeypair.publicKey,
            XTokenMintPubkey,
            publicKey,
            spl.TOKEN_PROGRAM_ID
            
        );


        const associatedSourceTokenAddr = await spl.getAssociatedTokenAddress(
          nft.mint,
          publicKey
        );


        const transferXTokensToTempAccIx = spl.createTransferInstruction(
            
            associatedSourceTokenAddr,
            tempXTokenAccountKeypair.publicKey,
            publicKey,
            1,
            [],
            spl.TOKEN_PROGRAM_ID,
        );

        const escrowKeypair = new web3.Keypair();
        const createEscrowAccountIx = web3.SystemProgram.createAccount({
          space: 73,
          lamports: await connection.getMinimumBalanceForRentExemption(
            73
          ),
          fromPubkey: publicKey,
          newAccountPubkey: escrowKeypair.publicKey,
          programId: programId,
        });

        console.log('amount', amount*web3.LAMPORTS_PER_SOL);

        const amountBN = new BN(amount*web3.LAMPORTS_PER_SOL).toArray("le", 8);

        console.log(amountBN);
        
        const initEscrowIx = new web3.TransactionInstruction({
          programId: programId,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            {
              pubkey: tempXTokenAccountKeypair.publicKey,
              isSigner: false,
              isWritable: true,
            },
            { pubkey: escrowKeypair.publicKey, isSigner: false, isWritable: true },
            { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: spl.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          ],
          data: Buffer.from(
           //Uint8Array.of(0)
            Uint8Array.of(0, ...amountBN)
          ),
        });
        console.log(initEscrowIx.data)


        const tx = new web3.Transaction().add(
          createTempTokenAccountIx,
          initTempAccountIx,
          transferXTokensToTempAccIx,
          createEscrowAccountIx,
          initEscrowIx
          
        );
        
        console.log(tx);
        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash; 
        tx.feePayer = publicKey;


        
        //tx.sign(tempXTokenAccountKeypair);

        console.log(tx.recentBlockhash);
        console.log("Sending Alice's transaction...");

        let signature = '';
        try {

            const signed = await signTransaction(tx);
            console.log('signed');

            signed.partialSign(tempXTokenAccountKeypair);
            signed.partialSign(escrowKeypair);

            signature = await sendTransaction(signed, connection);
            // now sign with the tokenAccount

            

            console.log('info', 'Transaction sent:', signature);

            await connection.confirmTransaction(signature, 'processed');
            console.log('success', 'Transaction successful!', signature);
        } catch (error) {
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }

        /*const transaction2 = new web3.Transaction().add(createEscrowAccountIx,initEscrowIx,);
        transaction2.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash; 
        console.log(transaction2.recentBlockhash);
        transaction2.feePayer = publicKey;*/


       
        console.log("finished stake NFT");
        setStaked(true);
         


    };


    return connected && (
      <div>
        
        <div>
          
          {!staked?
            <div className={styles.container}>
              <h1 className={styles.title}>Enter the amount you&apos;d like to borrow, max duration : 1 month</h1>
              <div className={styles.nftForm}>
                
                <h3 className={styles.title}>Amount (in SOL)</h3>
                <input
                  type="text"
                  value={amount}
                  onChange={handleChangeAmount}
                  
                />

              

              <button onClick={onClick}>Stake Card & Ask for loan</button>
              </div>
              
            </div>
            :
            <div className={styles.container}>
            <h1>This card is staked and waiting for a lender.</h1>
            
          </div>
}

      

        </div>
      </div>
    );
};
/*<h3 className={styles.title}>Date</h3>
              <input
                type="text"
                value={date}
                onChange={handleChangeDate}
                
              />*/
