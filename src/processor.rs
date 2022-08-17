/*use solana_program::{rent::Rent,pubkey::Pubkey,system_instruction, program_error::ProgramError, program::{invoke,invoke_signed}, account_info::{AccountInfo,next_account_info}, entrypoint::ProgramResult, msg};
use crate::constants::AMOUNT;
use crate::constants::CONTROLLER;
pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{


    let accountiter = &mut accounts.iter();

    


    let choice = instruction_data[0];

    // alice always initialize
    if choice == 0{
        let amount = instruction_data[1];
        let duration = instruction_data[2];

        let borrower = next_account_info(accountiter)?;

        // alice has put her nft

        let nft_account = next_account_info(accountiter)?;

        // alice creates an account with what she needs : amount, duration



    }

    // bob puts offer
    if choice == 1 {

        let amount = instruction_data[1];
        let duration = instruction_data[2];
        let interest = instruction_data[3];

        let borrower = next_account_info(accountiter)?;
        let lender = next_account_info(accountiter)?;

        // pda chest depends on the mint nft and on lender adress (or on offer ?)
        let pda_chest = next_account_info(accountiter)?;

        // check if nft is in correct pda token account

        let nft_account = next_account_info(accountiter)?;

        let nft_account_pubkey = nft_account.key;

        //registers interest 
        // create a new offer with reply
        // countaining reference to offer, interest

        // put sol in pda chest
        let sol_account = next_account_info(accountiter)?;
        let sol_account_pubkey = sol_account.key;
        let sol_account_balance = sol_account.data.borrow().len();
        if sol_account_balance != 0 {
            return Err(ProgramError::InvalidArgument);
        }

        // need a cancel system for bob

        // also for alice if she wants to get back her NFT

        // -> lots of verifications

        // after that alice accepts the offer. The NFT is blocked and she gets the money

        // bob can claim nft if > to limit days

        //alice can claim nft back if she puts exact amount in pda related to offer
        // the nft gains value

        //bob has to claim the money back with interest
        
        //finish !


        

        
        let system_program_info = next_account_info(accountiter)?;

    

        let bump_seed_a_b = instruction_data[1];

        let pda_expected_a_b = Pubkey::create_program_address(&[b"chest",source.key.as_ref(),destination.key.as_ref(),&[bump_seed_a_b]], program_id).unwrap();
        msg!("pda_expected_a_b: {:?}", pda_expected_a_b);
        assert_eq!(&pda_expected_a_b, pda_account_info_a_b.key);

        let pda_account_info_b_a = next_account_info(accountiter)?;

        let bump_seed_b_a = instruction_data[2];



        let pda_account_info_a_b = next_account_info(accountiter)?;
        msg!("initializing account a");

        let bump_seed_a_b = instruction_data[1];

        let pda_expected_a_b = Pubkey::create_program_address(&[b"chestb",source.key.as_ref(),destination.key.as_ref(),&[bump_seed_a_b]], program_id).unwrap();
        msg!("pda_expected_a_b: {:?}", pda_expected_a_b);
        assert_eq!(&pda_expected_a_b, pda_account_info_a_b.key);



        // if there is no account associated with the pda, we create it
        if (**pda_account_info_a_b.try_borrow_mut_lamports()?) == 0 {
            msg!("pda is empty");

            let ix = system_instruction::create_account(
                &source.key,
                &pda_account_info_a_b.key,
                Rent::default().minimum_balance(1),
                1,
                program_id
            );

            invoke_signed(
                &ix,
                &[
                    source.clone(),
                    pda_account_info_a_b.clone(),
                    system_program_info.clone()
                ],
                &[&[b"chestb",source.key.as_ref(),destination.key.as_ref(), &[bump_seed_a_b]]]
            )?;
        
            msg!("account created");
        }
        else {
            msg!("pda is not empty");   
        }

    }*/



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
                Self::process_init_escrow(accounts, amount, program_id)
            }
            
        }
    }

    fn process_init_escrow(
        accounts: &[AccountInfo],
        amount: u64,
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

        let escrow_account = next_account_info(account_info_iter)?;
        let rent = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

        if !rent.is_exempt(escrow_account.lamports(), escrow_account.data_len()) {
            return Err(EscrowError::NotRentExempt.into());
        }

        let mut escrow_info = Loan::unpack_unchecked(&escrow_account.try_borrow_data()?)?;
        if escrow_info.is_initialized() {
            return Err(ProgramError::AccountAlreadyInitialized);
        }

        escrow_info.is_initialized = true;
        escrow_info.initializer_pubkey = *initializer.key;
        escrow_info.temp_token_account_pubkey = *temp_token_account.key;
        escrow_info.expected_amount = amount;

        Loan::pack(escrow_info, &mut escrow_account.try_borrow_mut_data()?)?;
        let (pda, _nonce) = Pubkey::find_program_address(&[b"escrow"], program_id);

        let token_program = next_account_info(account_info_iter)?;
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

}