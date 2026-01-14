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
mod vault;
mod ngo;
mod beneficiary;
mod merchant;

// Export error types
pub use error::Error;

// Export event types and functions
pub use event::*;

// Export token utilities
pub use token::{TokenClient, to_display_amount, from_display_amount};

// Export main contracts
pub use vault::{ReliefVault, Campaign, BeneficiaryAllocation, SpendingAuthorization};
pub use ngo::{NGORegistry, NGOInfo, NGOStatus};
pub use beneficiary::{BeneficiaryRegistry, BeneficiaryInfo, BeneficiaryStatus, CategoryLimit};
pub use merchant::{MerchantRegistry, MerchantInfo, MerchantStatus};
