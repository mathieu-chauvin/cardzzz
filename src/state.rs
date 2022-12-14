use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

use arrayref::{array_mut_ref, array_ref, array_refs, mut_array_refs};

pub struct Loan {
    pub is_initialized: bool,
    pub initializer_pubkey: Pubkey,
    pub temp_token_account_pubkey: Pubkey,
    pub expected_amount: u64,
    pub start_time: i64
}

impl Sealed for Loan {}

impl IsInitialized for Loan {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for Loan {
    const LEN: usize = 81;
    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let src = array_ref![src, 0, Loan::LEN];
        let (
            is_initialized,
            initializer_pubkey,
            temp_token_account_pubkey,
            expected_amount,
            start_time
        ) = array_refs![src, 1, 32, 32, 8, 8];
        let is_initialized = match is_initialized {
            [0] => false,
            [1] => true,
            _ => return Err(ProgramError::InvalidAccountData),
        };

        Ok(Loan {
            is_initialized,
            initializer_pubkey: Pubkey::new_from_array(*initializer_pubkey),
            temp_token_account_pubkey: Pubkey::new_from_array(*temp_token_account_pubkey),
            expected_amount: u64::from_le_bytes(*expected_amount),
            start_time: i64::from_le_bytes(*start_time)
        })
    }

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let dst = array_mut_ref![dst, 0, Loan::LEN];
        let (
            is_initialized_dst,
            initializer_pubkey_dst,
            temp_token_account_pubkey_dst,
            expected_amount_dst,
            start_time_dst
        ) = mut_array_refs![dst, 1, 32, 32, 8, 8];

        let Loan {
            is_initialized,
            initializer_pubkey,
            temp_token_account_pubkey,
            expected_amount,
            start_time
        } = self;

        is_initialized_dst[0] = *is_initialized as u8;
        initializer_pubkey_dst.copy_from_slice(initializer_pubkey.as_ref());
        temp_token_account_pubkey_dst.copy_from_slice(temp_token_account_pubkey.as_ref());
        *expected_amount_dst = expected_amount.to_le_bytes();
        *start_time_dst = start_time.to_le_bytes();
    }
}