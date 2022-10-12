use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

use spl_token::state::Account as TokenAccount;

use crate::{error::EscrowError, instruction::LoanInstruction, state::Loan};
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
            LoanInstruction::LendLoan { } => {
                msg!("Instruction: LendLoan");
                Self::process_lend(accounts, program_id)
            },
            LoanInstruction::RepayLoan { } => {
                msg!("Instruction: RepayLoan");
                Self::process_repay(accounts, program_id)
                
            },
            LoanInstruction::ClaimLoan { } => {
                msg!("Instruction: ClaimLoan");
                Self::process_claim(accounts, program_id)
            
            }
            
            
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
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
        let token_program = next_account_info(account_info_iter)?;
        
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

        Ok(())
    }

    fn process_lend(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let initializer = next_account_info(account_info_iter)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let temp_token_account = next_account_info(account_info_iter)?;

        let token_to_receive_account = next_account_info(account_info_iter)?;
        if *token_to_receive_account.owner != spl_token::id() {
            return Err(ProgramError::IncorrectProgramId);
        }

        let loan_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        if !rent.is_exempt(loan_account.lamports(), loan_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }


        let (pda, _nonce) = Pubkey::find_program_address(&[b"loan"], program_id);

        

        Ok(())
    }


    fn process_claim(
        accounts: &[AccountInfo],
        program_id: &Pubkey,
    ) -> ProgramResult {

        let account_info_iter = &mut accounts.iter();
        let initializer = next_account_info(account_info_iter)?;

        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        let temp_token_account = next_account_info(account_info_iter)?;

        let token_to_receive_account = next_account_info(account_info_iter)?;
        if *token_to_receive_account.owner != spl_token::id() {
            return Err(ProgramError::IncorrectProgramId);
        }

        let loan_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        if !rent.is_exempt(loan_account.lamports(), loan_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }

        //check if the loan has been over limit date
        
        let (pda, _nonce) = Pubkey::find_program_address(&[b"loan"], program_id);


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
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
        let token_program = next_account_info(account_info_iter)?;
        let pda_account = next_account_info(account_info_iter)?;
        
        if !initializer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        /*if initializer.key != &loan_account.owner {
            return Err(ProgramError::);
        }*/


        /*if *token_to_receive_account.owner != spl_token::id() {
            return Err(ProgramError::IncorrectProgramId);
        }*/

        if !rent.is_exempt(loan_account.lamports(), loan_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }

        let (pda, nonce) = Pubkey::find_program_address(&[b"loan"], program_id);

/*        let owner_change_ix = spl_token::instruction::set_authority(
            token_program.key,
            temp_token_account.key,
            Some(initializer.key),
            spl_token::instruction::AuthorityType::AccountOwner,
            &pda,
            &[&pda],
        )?;

        msg!("Calling the token program to transfer token account ownership...");
        invoke_signed(
            &owner_change_ix,
            &[
                temp_token_account.clone(),
                initializer.clone(),
                token_program.clone(),
                pda_account.clone(),
            ],
            &[&[&b"loan"[..], &[nonce]]],
        )?;*/

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


        
        Ok(())
    }


}