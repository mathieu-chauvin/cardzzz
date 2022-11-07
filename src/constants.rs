pub const AMOUNT : u64 = 1000000000 as u64;

//pub const CONTROLLER : &str = "5UYUT1WU9kaHg87ehWsRUfmnYceogbwoACiwAhTBkiiu";
pub const CONTROLLER : [u8; 32] = [
   31, 147,  19, 157,  76, 242, 213, 216,
   60, 215, 225,  43,  59, 233, 141, 206,
  165, 103,  22, 107, 234,  69,  76, 120,
  167, 197, 249,  99, 209,  23, 195, 226
];

// interests for each card level, 1000000 = 1%
// TEST INTERESTS : remove before production
pub const INTERESTS : [u64; 5] = [200000000000000, 1000000, 1000000, 1000000, 1000000];
// interests for production
//pub const INTERESTS : [u64; 3] = [20000000, 10000000, 5000000];

// amount max for each card level, in lamports
pub const AMOUNT_MAX : [u64; 3] = [100000000, 500000000, 1000000000];