mod entrypoint;

pub mod processor;
pub mod instruction;
pub mod state;
pub mod error;

pub mod constants;
pub use solana_program;
use solana_program::{entrypoint::ProgramResult, program_error::ProgramError, pubkey::Pubkey};

solana_program::declare_id!("7QjC4bZTmXvwrHfJsVG1mjgAMx9QLGSGij9cSJ35LYUi");