import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import { TokenAccountNotFoundError } from '@solana/spl-token';

const BN = require('bn.js');

export const StakeCard = (props) => {
    const { metaplex } = useMetaplex();
    const { connection } = useConnection();
    const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

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
          space: 100,
          lamports: await connection.getMinimumBalanceForRentExemption(
            100
          ),
          fromPubkey: publicKey,
          newAccountPubkey: escrowKeypair.publicKey,
          programId: programId,
        });

        console.log('amount', amount);
        
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
            Uint8Array.of(0, ...new BN(amount).toArray("le", 8))
          ),
        });


        const tx = new web3.Transaction().add(
          createTempTokenAccountIx,
          initTempAccountIx,
          transferXTokensToTempAccIx,
          //createEscrowAccountIx,
          //initEscrowIx
        );
        
        console.log(connection);
        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash; 
        tx.feePayer = publicKey;


        
        //tx.sign(tempXTokenAccountKeypair);

        console.log(tx.recentBlockhash);
        console.log("Sending Alice's transaction...");

        let signature = '';
        let signature2 = '';
        try {
          const transaction = tx;

            const signed = await signTransaction(tx);
            console.log('signed');

            signed.partialSign(tempXTokenAccountKeypair);

            signature = await sendTransaction(signed, connection);
            // now sign with the tokenAccount

            

            console.log('info', 'Transaction sent:', signature);

            await connection.confirmTransaction(signature, 'processed');
            console.log('success', 'Transaction successful!', signature);
        } catch (error) {
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }

        const transaction2 = new web3.Transaction().add(createEscrowAccountIx,initEscrowIx);
        transaction2.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash; 
        console.log(transaction2.recentBlockhash);
        transaction2.feePayer = publicKey;


       try {

          

          const signed2 = await signTransaction(transaction2);
          console.log('signed2');
          // now sign with the escrow account
          signed2.partialSign(escrowKeypair);

          signature2 = await sendTransaction(transaction2, connection);
          

          console.log('info', 'Transaction sent:', signature2);

          await connection.confirmTransaction(signature2, 'processed');
          console.log('success', 'Transaction successful!', signature2);
      } catch (error) {
          console.log('error', `Transaction failed! ${error?.message}`, signature2);
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
            <h1 className={styles.title}>Enter the amount you'd like to borrow</h1>
            <div className={styles.nftForm}>
              
              <h3 className={styles.title}>Amount</h3>
              <input
                type="text"
                value={amount}
                onChange={handleChangeAmount}
                
              />

            

            <button onClick={onClick}>Stake Card & Ask for loan</button>
            </div>
            
          </div>
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
