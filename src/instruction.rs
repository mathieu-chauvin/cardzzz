use solana_program::program_error::ProgramError;
use std::convert::TryInto;

use crate::error::EscrowError::InvalidInstruction;

pub enum LoanInstruction {
    /// Starts the trade by creating and populating an escrow account and transferring ownership of the given temp token account to the PDA
    ///
    ///
    /// Accounts expected:
    ///
    /// 0. `[signer]` The account of the person initializing the escrow
    /// 1. `[writable]` Temporary token account that should be created prior to this instruction and owned by the initializer
    /// 2. `[writable]` The escrow account, it will hold all necessary info about the trade.
    /// 3. `[]` The rent sysvar
    /// 4. `[]` The token program
    InitLoan {
        /// The amount party A expects to receive of token Y
        amount: u64,
    },
}

impl LoanInstruction {
    /// Unpacks a byte buffer into a [LoanInstruction](enum.LoanInstruction.html).
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input.split_first().ok_or(InvalidInstruction)?;

        Ok(match tag {
            0 => Self::InitLoan {
                amount: Self::unpack_amount(rest)?,
            },
            /*1 => Self::Exchange {
                amount: Self::unpack_amount(rest)?,
            },*/
            _ => return Err(InvalidInstruction.into()),
        })
    }

    fn unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        Ok(amount)
    }
}