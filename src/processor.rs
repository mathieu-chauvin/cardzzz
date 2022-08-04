use solana_program::{rent::Rent,pubkey::Pubkey,system_instruction, program_error::ProgramError, program::{invoke,invoke_signed}, account_info::{AccountInfo,next_account_info}, entrypoint::ProgramResult, msg};
use crate::constants::AMOUNT;
use crate::constants::CONTROLLER;
pub fn process_instruction(program_id:&Pubkey, accounts:&[AccountInfo], instruction_data:&[u8])->ProgramResult{


    let accountiter = &mut accounts.iter();

    let source = next_account_info(accountiter)?;
    let destination = next_account_info(accountiter)?;

    
    let system_program_info = next_account_info(accountiter)?;


    let choice = instruction_data[0];


    // initialize the PDA account
    if choice == 0 {

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

    }

    else if choice == 1 {
        msg!("initializing account b");


        let pda_account_info_b_a = next_account_info(accountiter)?;


        let bump_seed_b_a = instruction_data[1];

        let pda_expected_b_a = Pubkey::create_program_address(&[b"chestb",destination.key.as_ref(),source.key.as_ref(),&[bump_seed_b_a]], program_id).unwrap();
        msg!("pda_expected_b_a: {:?}", pda_expected_b_a);
        msg!("pda_account_info_b_a: {:?}", pda_account_info_b_a.key);
        assert_eq!(&pda_expected_b_a, pda_account_info_b_a.key);
        

        // if there is no account associated with the pda, we create it
        if (**pda_account_info_b_a.try_borrow_mut_lamports()?) == 0 {
            msg!("pda is empty");

            let ix = system_instruction::create_account(
                &destination.key,
                &pda_account_info_b_a.key,
                Rent::default().minimum_balance(1),
                1,
                program_id
            );

            invoke_signed(
                &ix,
                &[
                    destination.clone(),
                    pda_account_info_b_a.clone(),
                    system_program_info.clone()
                ],
                &[&[b"chestb",destination.key.as_ref(),source.key.as_ref(), &[bump_seed_b_a]]]
            )?;
        
            msg!("account created");
        }
        else {
            msg!("pda is not empty");   
        }

    }

    // transfer lamports to the winner
    else if choice == 2 {
        msg!("dumping");
        let pda_account_info_a_b = next_account_info(accountiter)?;

        let bump_seed_a_b = instruction_data[1];

        let pda_expected_a_b = Pubkey::create_program_address(&[b"chestb",source.key.as_ref(),destination.key.as_ref(),&[bump_seed_a_b]], program_id).unwrap();
        msg!("pda_expected_a_b: {:?}", pda_expected_a_b);
        assert_eq!(&pda_expected_a_b, pda_account_info_a_b.key);

        let pda_account_info_b_a = next_account_info(accountiter)?;

        let bump_seed_b_a = instruction_data[2];

        let pda_expected_b_a = Pubkey::create_program_address(&[b"chestb",destination.key.as_ref(),source.key.as_ref(),&[bump_seed_b_a]], program_id).unwrap();
        msg!("pda_expected_b_a: {:?}", pda_expected_b_a);
        assert_eq!(&pda_expected_b_a, pda_account_info_b_a.key);


        let controller = next_account_info(accountiter)?;

        //let winner = next_account_info(accountiter)?;

        let controllerExpected = &Pubkey::new_from_array(CONTROLLER);

        msg!("controller_expected: {:?}", controllerExpected);
        msg!("controller: {:?}", controller.key);

        // winner = 0 if source wins, winner = 1 if destination wins
        let winner = instruction_data[3];
        let winner_account;
        if winner == 0 {
            msg!("source wins");
            winner_account = &source;
        }
        else {
            msg!("destination wins");
            winner_account = &destination;
        }

        /*if winner == 0 {
            msg!("source wins");
            let amount = instruction_data[4];
            let amount_expected = AMOUNT;
            assert_eq!(amount, amount_expected);
            let ix = system_instruction::transfer_from_program(
                &source.key,
                &pda_account_info_a_b.key,
                &controller.key,
                amount,
                program_id
            );
            invoke_signed(
                &ix,
                &[
                    source.clone(),
                    pda_account_info_a_b.clone(),
                    controller.clone(),
                    system_program_info.clone()
                ],
                &[&[b"chestb",source.key.as_ref(),destination.key.as_ref(), &[bump_seed_a_b]]]
            )?;
        }
        else {
            msg!("destination wins");
            let amount = instruction_data[4];
            let amount_expected = AMOUNT;
            assert_eq!(amount, amount_expected);
            let ix = system_instruction::transfer_from_program(
                &destination.key,
                &pda_account_info_b_a.key,
                &controller.key,
                amount,
                program_id
            );
            invoke_signed(
                &ix,
                &[
                    destination.clone(),
                    pda_account_info_b_a.clone(),
                    controller.clone(),
                    system_program_info.clone()
                ],
                &[&[b"chestb",destination.key.as_ref(),source.key.as_ref(), &[bump_seed_b_a]]]
            )?;
        }*/

        if (controller.key) != controllerExpected {
            return Err(ProgramError::InvalidArgument);
        }
        else {
            msg!("controller is valid");
        }

        if (!controller.is_signer){
            return Err(ProgramError::MissingRequiredSignature);
        }
        else {
            msg!("controller is signer");
        }

        // take sol from the 2 PDAs : winner and loser
        let amount_a_b = **pda_account_info_a_b.try_borrow_mut_lamports()? - Rent::default().minimum_balance(1);
        **pda_account_info_a_b.try_borrow_mut_lamports()? -= amount_a_b;
        **winner_account.try_borrow_mut_lamports()? += amount_a_b;

        let amount_b_a = **pda_account_info_b_a.try_borrow_mut_lamports()? - Rent::default().minimum_balance(1);
        **pda_account_info_b_a.try_borrow_mut_lamports()? -= amount_b_a;
        **winner_account.try_borrow_mut_lamports()? += amount_b_a;

    }

    // special : reset controller account by substracting all the lamports from it 
    // only use when necessary
    /*else if choice == 3 {
        

        let controller = next_account_info(accountiter)?;


        let controllerExpected = &Pubkey::new_from_array(CONTROLLER);

        if (controller.key) != controllerExpected {
            return Err(ProgramError::InvalidArgument);
        }
        else {
            msg!("controller is valid");
        }

        if (!controller.is_signer){
            return Err(ProgramError::MissingRequiredSignature);
        }
        else {
            msg!("controller is signer");
        }

        let amount_controller = **controller.try_borrow_mut_lamports()?;
        **controller.try_borrow_mut_lamports()? -= amount_controller;
        **source.try_borrow_mut_lamports()? += amount_controller;


    }*/


    else {
        msg!("error");

    }

        



    

    

   Ok(())
}