use soroban_sdk::contracterror;

/// Error types for Relifo smart contracts
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Caller is not authorized to perform this action
    Unauthorized = 1,
    
    /// Campaign does not exist
    CampaignNotFound = 2,
    
    /// Insufficient balance for operation
    InsufficientBalance = 3,
    
    /// Beneficiary is not whitelisted for this campaign
    BeneficiaryNotWhitelisted = 4,
    
    /// Category spending limit exceeded
    CategoryLimitExceeded = 5,
    
    /// Merchant is not approved for this category
    MerchantNotApproved = 6,
    
    /// Invalid amount (zero or negative)
    InvalidAmount = 7,
    
    /// Authorization not found or expired
    AuthorizationNotFound = 8,
    
    /// Contract already initialized
    AlreadyInitialized = 9,
    
    /// NGO is not registered
    NGONotRegistered = 10,
    
    /// NGO is not verified
    NGONotVerified = 11,
    
    /// Invalid control mode
    InvalidControlMode = 12,
    
    /// Beneficiary already exists
    BeneficiaryExists = 13,
    
    /// Merchant already registered
    MerchantExists = 14,
    
    /// Campaign already exists
    CampaignExists = 15,
}
