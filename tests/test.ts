import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';

import {expect} from 'chai';
//import exp from 'constants';
import 'mocha';
//import { sign } from 'crypto';
//console.log(solanaWeb3);

const BN = require('bn.js');

describe("escrow", ()=>{

    //const programKey = new web3.PublicKey("85hpvNKP1PdhwFDPYN8aaGV9owqDEXFD6CLNKZ7XY41m");

    const controller = [255,94,147,170,29,232,35,171,165,96,247,72,153,117,33,89,134,192,11,228,170,73,230,14,176,241,189,119,245,176,220,137,31,147,19,157,76,242,213,216,60,215,225,43,59,233,141,206,165,103,22,107,234,69,76,120,167,197,249,99,209,23,195,226]
    .slice(0,32);

    const controllerKeypair = web3.Keypair.fromSeed(Uint8Array.from(controller));

    //console.log(controllerKeypair.publicKey.toBytes());
    /*for (let entry in controllerKeypair.publicKey.toBytes().entries()) {
        console.log(entry);
    }*/
    //const arr = [...controllerKeypair.publicKey.toBytes()];
    //console.log(arr);
    /*let connection = new web3.Connection(
        'https://api.devnet.solana.com',
        'confirmed',
    );*/

    let connection = new web3.Connection(
        'http://127.0.0.1:8899',
        'confirmed',
    );

    const alice = web3.Keypair.generate();
    const bob = web3.Keypair.generate();

    const programId = new web3.PublicKey('7yo7fcTxAyAtF3PsoRmeXWeoNtUD5m9qykZ5jhWqtPbR');


    /*const carol = web3.Keypair.generate();
    const dave = web3.Keypair.generate();
    const eve = web3.Keypair.generate();
    const frank = web3.Keypair.generate();
    const george = web3.Keypair.generate();
    const hank = web3.Keypair.generate();
    const ian = web3.Keypair.generate();
    const james = web3.Keypair.generate();
    const kate = web3.Keypair.generate();
    const larry = web3.Keypair.generate();
    const mike = web3.Keypair.generate();*/
        //const chest = web3.Keypair.generate();
        
    
    console.log('controllerKeypair');
    console.log(controllerKeypair.publicKey.toBase58());


    const fromWallet = alice;
    const toWallet = bob;

    let mint;



    // alice put sol in chest
    it("initialize account a", async () => {

         // airdrop 5 sol to alice

         let airdropSignature = await connection.requestAirdrop(alice.publicKey, 1 * web3.LAMPORTS_PER_SOL);
         const latestBlockhash = await connection.getLatestBlockhash('confirmed');
     
         await connection.confirmTransaction({
             signature:airdropSignature,
             blockhash:latestBlockhash.blockhash,
             lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
         });

         console.log('before mint');


         const mint = await createMint(connection, alice, alice.publicKey, null, 0);
        //const pda_nft_account = await getOrCreateAssociatedTokenAccount(connection, alice.publicKey, chest_a_b[0]);


        //const chest_mint_pda = web3.PublicKey.findProgramAddressSync([Buffer.from("chest"), mint.toBuffer()],programKey);

        console.log('mint');
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );
        console.log('fromTokenAccount');

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet.publicKey);

        console.log('toTokenAccount');
        // Mint 1 new token to the "fromTokenAccount" account we just created
        let signature = await mintTo(
            connection,
            fromWallet,
            mint,
            fromTokenAccount.address,
            fromWallet.publicKey,
            1
        );
        console.log('mint tx:', signature);

            // Transfer the new token to the "toTokenAccount" we just created
        signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            1
        );

         
        const tempXTokenAccountKeypair = new web3.Keypair();
        const publicKey = alice.publicKey;

        const borrower_token_account_pubkey = fromTokenAccount.address;

        const XTokenMintPubkey = mint;
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
        
        const initTempAccountIx = spl.createInitializeAccountInstruction(
            tempXTokenAccountKeypair.publicKey,
            XTokenMintPubkey,
            publicKey,
            spl.TOKEN_PROGRAM_ID
        );


        const associatedSourceTokenAddr = await spl.getAssociatedTokenAddress(
          mint,
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

        const amount = 0.5;
        const escrowKeypair = new web3.Keypair();
        const createEscrowAccountIx = web3.SystemProgram.createAccount({
          space: 200,
          lamports: await connection.getMinimumBalanceForRentExemption(
            200
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
        
        //console.log(tx);
        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash; 
        tx.feePayer = publicKey;

        await web3.sendAndConfirmTransaction(connection, tx, [alice, escrowKeypair, tempXTokenAccountKeypair]);


        

    });

    it("bob put sol in chest", async () => {

        const amount = 10000000;
        const interest = 100;
        const duration = 10;

        /*const pkey = web3.PublicKey.createWithSeed(alice.publicKey, "offer",programKey;)
        const transactionCreateAccount().add(
            web3.SystemProgram.createAccountWithSeed({
                fromPubkey:alice.publicKey,

            })
        )

        const instruction_data = Uint8Array.from([amount,interest,duration]);

        const transaction = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:bob.publicKey, isSigner:true, isWritable:false},
                    {pubkey:alice.publicKey, isSigner:false, isWritable:true},
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                    {pubkey:mint, isSigner:false, isWritable:true},
                ],
                data:Buffer.from(instruction_data),
            }),
        );
        await web3.sendAndConfirmTransaction(connection,transaction,[bob]);*/



       
       
       

        //const programBalance = await connection.getBalance();

    });


});
