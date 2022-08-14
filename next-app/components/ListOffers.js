import styles from '../styles/Home.module.css'
import { useMetaplex } from "./useMetaplex";
import { useState } from "react";
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from "@solana/web3.js";
import * as spl from "@solana/spl-token";

export const StakeCard = (props) => {
    const { metaplex } = useMetaplex();
    const wallet = useWallet();
    const nft = props.nft;
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState(0);



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
        let myNfts = await metaplex.nfts().findAllByOwner(metaplex.identity().publicKey);
        if(!myNfts.length) {
            setNft(null);
            return;
        }
        wallet.sendTransaction(web3.Instruction.createAccount(myNfts[0].mint, myNfts[0].mint, 100));

        const pda = web3.SystemProgram.createAccountWithSeed

        //create an associated account for the NFT owned by the program
        const transaction1 = new web3.Transaction().add(
          new web3.TransactionInstruction({
              programId:programKey,
              keys:[
                  {pubkey:alice.publicKey, isSigner:true, isWritable:false},
                  {pubkey:bob.publicKey, isSigner:false, isWritable:true},
                  {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                  {pubkey:chest_a_b[0], isSigner:false, isWritable:true},
              ],
              data:Buffer.from(instruction_data_1),

          }),
          spl.transfer(connection, wallet.publicKey,wallet.publicKey, pda, wallet.publicKey, 1)
          //web3.SystemProgram.transfer({fromPubkey:alice.publicKey, toPubkey:chest_a_b[0], lamports:web3.LAMPORTS_PER_SOL})
      );
        
        const instr = web3.Instruction.createAccount(myNfts[0].mint, myNfts[0].mint, 100);


        const tempTokenAccount = new Account();
        const createTempTokenAccountIx = SystemProgram.createAccount({
            programId: TOKEN_PROGRAM_ID,
            space: AccountLayout.span,
            lamports: await connection.getMinimumBalanceForRentExemption(AccountLayout.span, 'confirmed'),
            fromPubkey: feePayerAcc.publicKey,
            newAccountPubkey: tempTokenAccount.publicKey
        });

    };


    return wallet.connected && (
      <div>
        
        <div>
          <div className={styles.container}>
            <h1 className={styles.title}>List of offers</h1>
            <div className={styles.nftForm}>
                <ul>
                    <li>{nft.mint.toBase58()}<button onClick={onClick}>Accept to lend</button></li>
                </ul>
              

            
            </div>
            
          </div>
        </div>
      </div>
    );
};
