#![no_std]

//! Relifo - Emergency & Disaster Relief Stablecoin System
//! 
//! Soroban smart contracts for transparent relief fund distribution
//! on Stellar blockchain with USDC stablecoin integration.
//! 
//! ## Contracts
//! - **ReliefVault**: Manages campaigns, donations, and fund distribution
//! - **NGORegistry**: Handles NGO registration and verification
//! - **BeneficiaryRegistry**: Manages beneficiary whitelisting (Controlled Mode)
//! - **MerchantRegistry**: Manages approved merchants (Controlled Mode)

mod error;
mod event;
mod token;
pub use error::Error;
pub use event::*;
pub use token::{TokenClient, to_display_amount, from_display_amount};

// Build feature flags to compile one contract at a time
// Default: ReliefVault
#[cfg(not(any(feature = "ngo", feature = "beneficiary", feature = "merchant")))]
mod vault;
#[cfg(not(any(feature = "ngo", feature = "beneficiary", feature = "merchant")))]
pub use vault::{ReliefVault, Campaign, BeneficiaryAllocation, SpendingAuthorization};

#[cfg(feature = "ngo")]
mod ngo;
#[cfg(feature = "ngo")]
pub use ngo::{NGORegistry, NGOInfo, NGOStatus};

#[cfg(feature = "beneficiary")]
mod beneficiary;
#[cfg(feature = "beneficiary")]
pub use beneficiary::{BeneficiaryRegistry, BeneficiaryInfo, BeneficiaryStatus, CategoryLimit};

#[cfg(feature = "merchant")]
mod merchant;
#[cfg(feature = "merchant")]
pub use merchant::{MerchantRegistry, MerchantInfo, MerchantStatus};
