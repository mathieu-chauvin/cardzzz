use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
    sysvar::ID as SYSVAR_ID,
    system_instruction,
};

use spl_token::state::Account as TokenAccount;


use crate::{constants::{CONTROLLER, AMOUNT_MAX, INTERESTS}, error::EscrowError, instruction::LoanInstruction, state::Loan};
pub struct Processor;
impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = LoanInstruction::unpack(instruction_data)?;

        match instruction {
            LoanInstruction::InitLoan { amount } => {
                msg!("Instruction: InitLoan");
                Self::process_init_loan(accounts, amount, program_id)
            },
            LoanInstruction::RepayLoan { } => {
                msg!("Instruction: RepayLoan");
                Self::process_repay(accounts, program_id)
                
            },
            LoanInstruction::WithdrawPool { pool_id } => {
                msg!("Instruction: WithdrawPool");
                Self::process_withdraw_pool(accounts, pool_id, program_id)
            
            },
            LoanInstruction::InitPool { pool_id } => {
                msg!("Instruction: InitPool");
                Self::process_init_pool(accounts, pool_id, program_id)
            },
            
            
        }
    }

    fn process_init_loan(
        accounts: &[AccountInfo],
        amount: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let initializer = next_account_info(account_info_iter)?;
        let temp_token_account = next_account_info(account_info_iter)?;
        let loan_account = next_account_info(account_info_iter)?;
        let pool_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
        let token_program = next_account_info(account_info_iter)?;
        let system_program = next_account_info(account_info_iter)?;
        
        let mut loan_info = Loan::unpack_unchecked(&loan_account.try_borrow_data()?)?;
        
        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        if !rent.is_exempt(loan_account.lamports(), loan_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }

        if loan_info.is_initialized() {
            return Err(ProgramError::AccountAlreadyInitialized);
        }

        loan_info.is_initialized = true;
        loan_info.initializer_pubkey = *initializer.key;
        loan_info.temp_token_account_pubkey = *temp_token_account.key;
        loan_info.expected_amount = amount;

        Loan::pack(loan_info, &mut loan_account.try_borrow_mut_data()?)?;
        let (pda, _nonce) = Pubkey::find_program_address(&[b"loan"], program_id);

        let owner_change_ix = spl_token::instruction::set_authority(
            token_program.key,
            temp_token_account.key,
            Some(&pda),
            spl_token::instruction::AuthorityType::AccountOwner,
            initializer.key,
            &[&initializer.key],
        )?;

        msg!("Calling the token program to transfer token account ownership...");
        invoke(
            &owner_change_ix,
            &[
                temp_token_account.clone(),
                initializer.clone(),
                token_program.clone(),
            ],
        )?;

        // get back the value of the loan

        //get associated pool pda
        //TODO : implement other pools ids according to card id
        let pool_id:u8 = 0;
        let (pool_pda, nonce) = Pubkey::find_program_address(&[b"pool",&[pool_id]], program_id);

        // check pda
        if (&pool_pda != pool_account.key) {
            return Err(ProgramError::InvalidAccountData);
        }

        //transfer 0.05 sol to the initializer

        **pool_account.try_borrow_mut_lamports()? -= AMOUNT_MAX[0] as u64;
        **initializer.try_borrow_mut_lamports()? += AMOUNT_MAX[0] as u64;


        Ok(())
    }

    
    fn process_repay(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();

        let initializer = next_account_info(account_info_iter)?;
        let temp_token_account = next_account_info(account_info_iter)?;
        let token_to_receive_account = next_account_info(account_info_iter)?;
        let loan_account = next_account_info(account_info_iter)?;
        let pool_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
        let system_program = next_account_info(account_info_iter)?;
        let token_program = next_account_info(account_info_iter)?;
        let pda_account = next_account_info(account_info_iter)?;

        let loan_info = Loan::unpack(&loan_account.try_borrow_data()?)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }


        if !rent.is_exempt(loan_account.lamports(), loan_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }


        if initializer.key != &loan_info.initializer_pubkey {
            return Err(EscrowError::InvalidInitializer.into());
        }

        if loan_info.temp_token_account_pubkey != *temp_token_account.key {
            return Err(EscrowError::InvalidTempTokenAccount.into());
        }


        // check pool account pda
        let pool_id:u8 = 0;
        let (pool_pda, nonce) = Pubkey::find_program_address(&[b"pool",&[pool_id]], program_id);

        if (&pool_pda != pool_account.key) {
            return Err(ProgramError::InvalidAccountData);
        }


        let (pda, nonce) = Pubkey::find_program_address(&[b"loan"], program_id);
        //handling floats is hard. Trying to keep numbers as integers
        let amount_with_interest = AMOUNT_MAX[0] + (AMOUNT_MAX[0]*INTERESTS[0]/100000000) as u64;
        let transferLamportsIx = system_instruction::transfer(
            initializer.key,
            pool_account.key,
            amount_with_interest,
        );

        invoke(&transferLamportsIx, &[initializer.clone(), pool_account.clone(), system_program.clone()])?;

        let transfer_ix = spl_token::instruction::transfer(
            token_program.key,
            temp_token_account.key,
            token_to_receive_account.key,
            &pda,
            &[&pda],
            1,
        )?;

        invoke_signed(
            &transfer_ix,
            &[
                token_program.clone(),
                temp_token_account.clone(),
                token_to_receive_account.clone(),
                initializer.clone(),
                pda_account.clone(),
            ],
            //&[&[b"loan", &[nonce]]],
            &[&[&b"loan"[..], &[nonce]]],
        )?;

        msg!("Closing the escrow account...");
        **initializer.try_borrow_mut_lamports()? = initializer
            .lamports()
            .checked_add(loan_account.lamports())
            .ok_or(EscrowError::AmountOverflow)?;
        **loan_account.try_borrow_mut_lamports()? = 0;
        *loan_account.try_borrow_mut_data()? = &mut [];


        
        Ok(())
    }

    

    fn process_init_pool(
        accounts: &[AccountInfo],
        pool_id: u8,
        program_id: &Pubkey,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();

        let initializer = next_account_info(account_info_iter)?;
        let pool_account = next_account_info(account_info_iter)?;
        let rent_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(rent_account)?;
        let system_info = next_account_info(account_info_iter)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        if initializer.key.to_bytes() != CONTROLLER {
            return Err(EscrowError::InvalidController.into());
        }

        // create an account own by the program
        let (pda, nonce) = Pubkey::find_program_address(&[b"pool", &[pool_id]], program_id);

        if pda != *pool_account.key {
            return Err(ProgramError::InvalidAccountData);
        }
        
        // when we initialize the pool, we need to put at least 0.5 sol in the pool

        let create_account_ix = system_instruction::create_account(
            &initializer.key,
            &pda,
            rent.minimum_balance(5) + 500000000 as u64,
            5,
            &program_id,
        );

        //send the transaction to the chain

        invoke_signed(
            &create_account_ix,
            &[
                initializer.clone(),
                pool_account.clone(),
                rent_account.clone(),
                system_info.clone(),

                ],
            &[&[&b"pool"[..], &[pool_id], &[nonce]]],
        )?;
        
        Ok(())
    }


    fn process_withdraw_pool(
        accounts: &[AccountInfo],
        pool_id: u8,
        program_id: &Pubkey,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();
        let initializer = next_account_info(account_info_iter)?;
        let pool_account = next_account_info(account_info_iter)?;
        


        if initializer.key.to_bytes() != CONTROLLER {
            return Err(EscrowError::InvalidController.into());
        }

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let (pda, nonce) = Pubkey::find_program_address(&[b"pool", &[pool_id]], program_id);

        //check pda
        if &pda != pool_account.key {
            return Err(ProgramError::InvalidAccountData);
        }

        //transfer sol from the pool to the controller
        **pool_account.try_borrow_mut_lamports()? = pool_account
            .lamports()- 100000000 as u64;

        **initializer.try_borrow_mut_lamports()? = initializer
            .lamports() + 100000000 as u64;
        
        Ok(())
    }

}