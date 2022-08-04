import * as web3 from '@solana/web3.js';

import {expect} from 'chai';
import exp from 'constants';
import 'mocha';
//import { sign } from 'crypto';
//console.log(solanaWeb3);

describe("escrow", ()=>{

    const programKey = new web3.PublicKey("85hpvNKP1PdhwFDPYN8aaGV9owqDEXFD6CLNKZ7XY41m");

    const controller = [255,94,147,170,29,232,35,171,165,96,247,72,153,117,33,89,134,192,11,228,170,73,230,14,176,241,189,119,245,176,220,137,31,147,19,157,76,242,213,216,60,215,225,43,59,233,141,206,165,103,22,107,234,69,76,120,167,197,249,99,209,23,195,226]
    .slice(0,32);

    const controllerKeypair = web3.Keypair.fromSeed(Uint8Array.from(controller));



    //console.log(controllerKeypair.publicKey.toBytes());
    /*for (let entry in controllerKeypair.publicKey.toBytes().entries()) {
        console.log(entry);
    }*/
    const arr = [...controllerKeypair.publicKey.toBytes()];
    console.log(arr);
    let connection = new web3.Connection(
        'http://localhost:8899',
        'confirmed',
    );

    const alice = web3.Keypair.generate();
    const bob = web3.Keypair.generate();


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
        
    const chest_a_b = web3.PublicKey.findProgramAddressSync([Buffer.from("chestb"), alice.publicKey.toBuffer(), bob.publicKey.toBuffer()],programKey);
    const chest_b_a = web3.PublicKey.findProgramAddressSync([Buffer.from("chestb"), bob.publicKey.toBuffer(), alice.publicKey.toBuffer()],programKey);
    
    console.log('controllerKeypair');
    console.log(controllerKeypair.publicKey.toBase58());

    console.log('chest_b_a');
    console.log(chest_b_a[0].toBase58());


    // alice put sol in chest
    it("initialize account a", async () => {
        

        // airdrop 5 sol to alice


        let airdropSignature = await connection.requestAirdrop(alice.publicKey, 5 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature,
            blockhash:latestBlockhash.blockhash,
            lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
        });

        let airdropSignature2 = await connection.requestAirdrop(controllerKeypair.publicKey, 1 * web3.LAMPORTS_PER_SOL);
        const latestBlockhash2 = await connection.getLatestBlockhash('confirmed');
    
        await connection.confirmTransaction({
            signature:airdropSignature2,
            blockhash:latestBlockhash2.blockhash,
            lastValidBlockHeight:latestBlockhash2.lastValidBlockHeight
        });
        

        const balance = await connection.getBalance(controllerKeypair.publicKey);
        console.log(balance);

        const instruction_data_1 = Uint8Array.from([0,chest_a_b[1]]);

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
            web3.SystemProgram.transfer({fromPubkey:alice.publicKey, toPubkey:chest_a_b[0], lamports:web3.LAMPORTS_PER_SOL})
        );

        await web3.sendAndConfirmTransaction(connection,transaction1,[alice]);
        

        console.log('transaction1 finished');
        

        const programBalance = await connection.getBalance(chest_a_b[0]);

        expect(programBalance).to.equal(1*web3.LAMPORTS_PER_SOL+await connection.getMinimumBalanceForRentExemption(1));
    
    

    });

    it("bob put sol in chest", async () => {

       // airdrop 5 sol to alice


       let airdropSignature = await connection.requestAirdrop(bob.publicKey, 5 * web3.LAMPORTS_PER_SOL);
       const latestBlockhash = await connection.getLatestBlockhash('confirmed');
   
       await connection.confirmTransaction({
           signature:airdropSignature,
           blockhash:latestBlockhash.blockhash,
           lastValidBlockHeight:latestBlockhash.lastValidBlockHeight
       });
       
       

       const instruction_data_1 = Uint8Array.from([1,chest_b_a[1]]);

       const transaction1 = new web3.Transaction().add(
           new web3.TransactionInstruction({
               programId:programKey,
               keys:[
                   {pubkey:alice.publicKey, isSigner:false, isWritable:false},
                   {pubkey:bob.publicKey, isSigner:true, isWritable:true},
                   {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                   {pubkey:chest_b_a[0], isSigner:false, isWritable:true},
               ],
               data:Buffer.from(instruction_data_1),

           }),
           web3.SystemProgram.transfer({fromPubkey:bob.publicKey, toPubkey:chest_b_a[0], lamports:web3.LAMPORTS_PER_SOL})
       );

       await web3.sendAndConfirmTransaction(connection,transaction1,[bob]);
       

       console.log('transaction1 finished');
       

       const programBalance = await connection.getBalance(chest_b_a[0]);

       expect(programBalance).to.equal(1*web3.LAMPORTS_PER_SOL+await connection.getMinimumBalanceForRentExemption(1));

    });

    it("program sends sol to winner", async () => {



        const instruction_data_2 = Uint8Array.from([2,chest_a_b[1],chest_b_a[1],1]);

        const transaction2 = new web3.Transaction().add(
            new web3.TransactionInstruction({
                programId:programKey,
                keys:[
                    {pubkey:alice.publicKey, isSigner:false, isWritable:true},
                    {pubkey:bob.publicKey, isSigner:false, isWritable:true},
                    {pubkey:web3.SystemProgram.programId, isSigner:false, isWritable:false},
                    {pubkey:chest_a_b[0], isSigner:false, isWritable:true},
                    {pubkey:chest_b_a[0], isSigner:false, isWritable:true},
                    {pubkey:controllerKeypair.publicKey, isSigner:true, isWritable:true},
                ],
                data:Buffer.from(instruction_data_2),
            })
        );
    
        await web3.sendAndConfirmTransaction(connection, transaction2, [controllerKeypair]);


        const aliceBalance = await connection.getBalance(alice.publicKey);
        console.log('alice');
        console.log(aliceBalance);

        const chestBalance_a_b = await connection.getBalance(chest_a_b[0]);
        expect(chestBalance_a_b).to.equal(await connection.getMinimumBalanceForRentExemption(1));

        const chestBalance_b_a = await connection.getBalance(chest_b_a[0]);
        expect(chestBalance_b_a).to.equal(await connection.getMinimumBalanceForRentExemption(1));

        const bobBalance = await connection.getBalance(bob.publicKey);

        // 5 sol initialized + 1 sol win - cost of 2 transactions
        expect(bobBalance).to.approximately(6*web3.LAMPORTS_PER_SOL-3*5000-await connection.getMinimumBalanceForRentExemption(1), 500000);
    

    });

});
