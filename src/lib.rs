mod entrypoint;

pub mod processor;
pub mod instruction;
pub mod state;
pub mod error;

pub mod constants;
pub use solana_program;
use solana_program::{entrypoint::ProgramResult, program_error::ProgramError, pubkey::Pubkey};

solana_program::declare_id!("85hpvNKP1PdhwFDPYN8aaGV9owqDEXFD6CLNKZ7XY41m");