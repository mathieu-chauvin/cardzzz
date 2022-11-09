pub const AMOUNT : u64 = 1000000000 as u64;

//pub const CONTROLLER : &str = "5UYUT1WU9kaHg87ehWsRUfmnYceogbwoACiwAhTBkiiu";
pub const CONTROLLER : [u8; 32] = [66,125,4,55,33,163,65,183,126,208,51,55,15,182,240,188,108,197,179,30,123,58,70,16,216,194,117,200,29,40,234,90];

// interests for each card level, 1000000 = 1%
// TEST INTERESTS : remove before production
//pub const INTERESTS : [u64; 5] = [200000000000000, 1000000, 1000000, 1000000, 1000000];
// interests for production
pub const INTERESTS : [u64; 3] = [2000000000, 10000000, 5000000];

// amount max for each card level, in lamports
pub const AMOUNT_MAX : [u64; 3] = [100000000, 500000000, 1000000000];