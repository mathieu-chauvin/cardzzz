import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer, AccountLayout } from '@solana/spl-token';

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

    let connection = new web3.Connection(
        'http://127.0.0.1:8899',
        'confirmed',
    );

    const alice = web3.Keypair.generate();

    console.log('alice : ',alice.publicKey.toBase58());

    const bob = web3.Keypair.generate();

    const programId = new web3.PublicKey('3ZiToDihomfj9C78gTH7ieZxDSTqRHETf6DQVogyTcJA');
    
    console.log('controllerKeypair');
    console.log(controllerKeypair.publicKey.toBase58());


    const fromWallet = alice;
    const toWallet = bob;

    let mint: web3.PublicKey;
    let associatedSourceTokenAddr: web3.PublicKey;
 
    const tempXTokenAccountKeypair = new web3.Keypair();
    const publicKey = alice.publicKey;
    const escrowKeypair = new web3.Keypair();
    let aliceBalanceStart = 1 * web3.LAMPORTS_PER_SOL;

    before(async () => {
        let airdropSignatureAlice = await connection.requestAirdrop(alice.publicKey, aliceBalanceStart);
         const latestBlockhash = await connection.getLatestBlockhash('confirmed');
     
         await connection.confirmTransaction({
             signature:airdropSignatureAlice,
             blockhash:latestBlockhash.blockhash,
             lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
         });

        let airdropSignatureController = await connection.requestAirdrop(controllerKeypair.publicKey, 1 * web3.LAMPORTS_PER_SOL);
         const latestBlockhash2 = await connection.getLatestBlockhash('confirmed');
     
         await connection.confirmTransaction({
             signature:airdropSignatureController,
             blockhash:latestBlockhash2.blockhash,
             lastValidBlockHeight:latestBlockhash2.lastValidBlockHeight
         });
        
         const poolId = 0;
        //get pda for pool account from poolId
        const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
          [Buffer.from('pool'),Buffer.from([poolId])],
          programId
        );
         let airdropSignaturePool = await connection.requestAirdrop(poolAccount, 1 * web3.LAMPORTS_PER_SOL);
         const latestBlockhash3 = await connection.getLatestBlockhash('confirmed');
     
         await connection.confirmTransaction({
             signature:airdropSignaturePool,
             blockhash:latestBlockhash3.blockhash,
             lastValidBlockHeight:latestBlockhash3.lastValidBlockHeight
         });

        mint = await createMint(connection, alice, alice.publicKey, null, 0);    
        associatedSourceTokenAddr = await spl.getAssociatedTokenAddress(
          mint,
          publicKey
        );
    }); 

    it ("controller initialize a pool", async ()=>{
      const poolId = 0;
      //get pda for pool account from poolId
      const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
        [Buffer.from('pool'),Buffer.from([poolId])],
        programId
      );

      // get a random int between 1 and 255
      const randomInt = Math.floor(Math.random() * 255) + 1;
      console.log("pool", randomInt);

      // call program init pool instyuction
      const pool_init_ix = new web3.TransactionInstruction({
        keys: [
          { pubkey: controllerKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: poolAccount, isSigner: false, isWritable: true },
          { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          // system info account
          { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from([4,randomInt]), // create a random pool 
      });
     
      const blockhash = await connection.getLatestBlockhash();
      const tx = new web3.Transaction().add(pool_init_ix);
      tx.recentBlockhash = blockhash.blockhash;
      tx.feePayer = controllerKeypair.publicKey;
      tx.sign(controllerKeypair);
      await web3.sendAndConfirmTransaction(connection, tx, [controllerKeypair]).catch (err => {
        console.log(err);
      });
      


    });



    it("initialize account a", async () => {

         // airdrop 5 sol to alice

         
        //const pda_nft_account = await getOrCreateAssociatedTokenAccount(connection, alice.publicKey, chest_a_b[0]);


        //const chest_mint_pda = web3.PublicKey.findProgramAddressSync([Buffer.from("chest"), mint.toBuffer()],programKey);
        const poolId = 0;
        //get pda for pool account from poolId
        const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
          [Buffer.from('pool'),Buffer.from([poolId])],
          programId
        );
        console.log('mint', mint.toBase58());
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


       

        console.log('associatedSourceTokenAddr', associatedSourceTokenAddr.toBase58());


        const transferXTokensToTempAccIx = spl.createTransferInstruction(
            
            associatedSourceTokenAddr,
            tempXTokenAccountKeypair.publicKey,
            publicKey,
            1,
        );

        const amount = 0.5;
        const createEscrowAccountIx = web3.SystemProgram.createAccount({
          space: 73,
          lamports: await connection.getMinimumBalanceForRentExemption(
            73
          ),
          fromPubkey: publicKey,
          newAccountPubkey: escrowKeypair.publicKey,
          programId: programId,
        });

        console.log('createEscrowAccountIx', escrowKeypair.publicKey.toBase58());

        console.log('amount', amount*web3.LAMPORTS_PER_SOL);

        const amountBN = new BN(amount*web3.LAMPORTS_PER_SOL).toArray("le", 8);

        console.log(amountBN);


        const aliceBalanceBefore = await connection.getBalance(publicKey);
        console.log('aliceBalanceBefore', aliceBalanceBefore);
 
        
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
            { pubkey: poolAccount, isSigner: false, isWritable: true },
            { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: spl.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
          ],
          data: Buffer.from(
           //Uint8Array.of(0)
            Uint8Array.of(0, ...amountBN)
          ),
        });

        console.log(initEscrowIx.data)
        console.log('hello')


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

        await web3.sendAndConfirmTransaction(connection, tx, [alice, escrowKeypair,tempXTokenAccountKeypair]);

        console.log("Token                                         Balance");
        console.log("------------------------------------------------------------");
        const tokenAccount = await connection.getAccountInfo(tempXTokenAccountKeypair.publicKey);

        expect(tokenAccount).is.not.null;
        
        if (tokenAccount) {
            const accountData = AccountLayout.decode(tokenAccount.data);
            console.log(`${new web3.PublicKey(accountData.mint)}   ${accountData.amount}`);

            console.log("------------------------------------------------------------");
            console.log(accountData.amount);
            expect(accountData.amount).to.equal(BigInt(1));
            console.log("------------------------------------------------------------");
            console.log(accountData.owner.toBase58());
            const find_program_address = await web3.PublicKey.findProgramAddressSync([Buffer.from("loan")],programId);
            expect(accountData.owner.toBase58()).to.equal(find_program_address[0].toBase58());
        }

        // get alice solana balance
        const aliceBalance = await connection.getBalance(publicKey);
        expect(aliceBalance).to.approximately(aliceBalanceStart+50000000,10000000);


    });

    it("alice repays her loan", async () => {

        const pda_account = await web3.PublicKey.findProgramAddress([Buffer.from("loan")], programId);
        console.log('pda_account', pda_account[0].toBase58());
        console.log('source', associatedSourceTokenAddr.toBase58());
       const poolId = 0;
        //get pda for pool account from poolId
        const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
          [Buffer.from('pool'),Buffer.from([poolId])],
          programId
        );
        
        const paybackIx = new web3.TransactionInstruction({
          programId: programId,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false },
            {
              pubkey: tempXTokenAccountKeypair.publicKey,
              isSigner: false,
              isWritable: true,
            },
            { pubkey: associatedSourceTokenAddr, isSigner: false, isWritable: true },
            { pubkey: escrowKeypair.publicKey, isSigner: false, isWritable: true },
            { pubkey: poolAccount, isSigner: false, isWritable: true },
            { pubkey: web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
            { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: spl.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: pda_account[0], isSigner: false, isWritable: false },
          ],
          data: Buffer.from(
           //Uint8Array.of(0)
            Uint8Array.of(2)
          ),
       });

        const tx = new web3.Transaction().add(
          paybackIx
        );

        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash;
        tx.feePayer = publicKey;
        await web3.sendAndConfirmTransaction(connection, tx, [alice]);


        console.log("Token                                         Balance");
        console.log("------------------------------------------------------------");
        const tokenAccount = await connection.getAccountInfo(associatedSourceTokenAddr);
        expect(tokenAccount).is.not.null;
        if (tokenAccount) {
            const accountData = AccountLayout.decode(tokenAccount.data);
            console.log(`${new web3.PublicKey(accountData.mint)}   ${accountData.amount}`);
            console.log("------------------------------------------------------------");
            expect(accountData.amount).to.equal(BigInt(1));
            console.log("------------------------------------------------------------");
        }

        // get alice solana balance
        const aliceBalance = await connection.getBalance(publicKey);
        expect(aliceBalance).to.approximately(aliceBalanceStart-5000000,10000000);
        
        
        

    });

    it("controller withdraws from the pool", async () => {
        const controllerBeforeBalance = await connection.getBalance(controllerKeypair.publicKey);
        console.log('controllerBeforeBalance', controllerBeforeBalance);
        const poolId = 0;
        //get pda for pool account from poolId
        const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
          [Buffer.from('pool'),Buffer.from([poolId])],
          programId
        );
        const withdrawIx = new web3.TransactionInstruction({
          programId: programId,
          keys: [
            { pubkey: controllerKeypair.publicKey, isSigner: true, isWritable: false },
            { pubkey: poolAccount, isSigner: false, isWritable: true },
          ],
          data: Buffer.from(
            Uint8Array.of(1, poolId)
          ),
        });

        const tx = new web3.Transaction().add(
          withdrawIx
        );

        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash;
        tx.feePayer = controllerKeypair.publicKey;
        await web3.sendAndConfirmTransaction(connection, tx, [controllerKeypair]);

        const controllerAfterBalance = await connection.getBalance(controllerKeypair.publicKey);
        console.log('controllerAfterBalance', controllerAfterBalance);
        expect(controllerAfterBalance).to.approximately(controllerBeforeBalance+100000000,1000000);

    });

    it("wrong user tries to withdraw from the pool", async () => {
        const userKeypair = web3.Keypair.generate();

        //do an airdop to user
        const airdrop =  await connection.requestAirdrop(userKeypair.publicKey, 1000000000)
        
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
     
         await connection.confirmTransaction({
             signature:airdrop,
             blockhash:latestBlockhash.blockhash,
             lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
         });
;

        const poolId = 0;
        //get pda for pool account from poolId
        const [poolAccount, bumpSeed] = await web3.PublicKey.findProgramAddress(
          [Buffer.from('pool'),Buffer.from([poolId])],
          programId
        );

        const withdrawIx = new web3.TransactionInstruction({
          programId: programId,
          keys: [
            { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
            { pubkey: poolAccount, isSigner: false, isWritable: true },
          ],
          data: Buffer.from(
            Uint8Array.of(1, poolId)
          ),
        });

        const tx = new web3.Transaction().add(
          withdrawIx
        );

        tx.recentBlockhash= (await connection.getLatestBlockhash('finalized')).blockhash;
        tx.feePayer = userKeypair.publicKey;
        await web3.sendAndConfirmTransaction(connection, tx, [userKeypair]).catch((err) => {
            console.log(err);
            expect(err).to.be.not.null;
            expect(err.message).to.equal('failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x6');
        });

        
    });


});
