use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol, Vec};
use crate::error::Error;
use crate::event;
use crate::token::TokenClient;

// Storage keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const USDC_TOKEN: Symbol = symbol_short!("USDC");
const CAMPAIGNS: Symbol = symbol_short!("CAMPAIGNS");
const BALANCES: Symbol = symbol_short!("BALANCES");
const ALLOCATIONS: Symbol = symbol_short!("ALLOCS");
const AUTHS: Symbol = symbol_short!("AUTHS");
const AUTH_COUNTER: Symbol = symbol_short!("AUTH_CNT");

/// Campaign data structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Campaign {
    pub campaign_id: String,
    pub ngo_address: Address,
    pub target_amount: i128,
    pub control_mode: String, // "DIRECT" or "CONTROLLED"
    pub created_at: u64,
    pub status: String, // "ACTIVE", "PAUSED", "CLOSED"
}

/// Beneficiary allocation data
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BeneficiaryAllocation {
    pub beneficiary: Address,
    pub campaign_id: String,
    pub total_amount: i128,
    pub spent: i128,
    pub control_mode: String,
    pub categories: Vec<String>, // ["food", "medicine", "shelter"]
    pub category_limits: Map<String, i128>,
    pub category_spent: Map<String, i128>,
}

/// Spending authorization data
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingAuthorization {
    pub auth_id: u64,
    pub beneficiary: Address,
    pub merchant: Address,
    pub amount: i128,
    pub category: String,
    pub created_at: u64,
    pub status: String, // "PENDING", "EXECUTED", "CANCELLED"
}

/// ReliefVault Contract
/// Manages relief campaigns, donations, and fund distribution
#[contract]
pub struct ReliefVault;

#[contractimpl]
impl ReliefVault {
    /// Initialize the vault contract
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc_token: Address,
    ) -> Result<(), Error> {
        admin.require_auth();

        // Check if already initialized
        if env.storage().instance().has(&ADMIN) {
            return Err(Error::AlreadyInitialized);
        }

        // Store admin and USDC token address
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&USDC_TOKEN, &usdc_token);
        
        // Initialize empty maps
        let campaigns: Map<String, Campaign> = Map::new(&env);
        let balances: Map<String, i128> = Map::new(&env);
        let allocations: Map<Address, BeneficiaryAllocation> = Map::new(&env);
        let auths: Map<u64, SpendingAuthorization> = Map::new(&env);
        
        env.storage().instance().set(&CAMPAIGNS, &campaigns);
        env.storage().instance().set(&BALANCES, &balances);
        env.storage().instance().set(&ALLOCATIONS, &allocations);
        env.storage().instance().set(&AUTHS, &auths);
        env.storage().instance().set(&AUTH_COUNTER, &0u64);

        Ok(())
    }

    /// Create a new relief campaign
    pub fn create_campaign(
        env: Env,
        ngo_address: Address,
        campaign_id: String,
        target_amount: i128,
        control_mode: String,
    ) -> Result<(), Error> {
        ngo_address.require_auth();

        if target_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Validate control mode
        if control_mode != String::from_str(&env, "DIRECT") 
            && control_mode != String::from_str(&env, "CONTROLLED") {
            return Err(Error::InvalidControlMode);
        }

        // Get campaigns map
        let mut campaigns: Map<String, Campaign> = env.storage()
            .instance()
            .get(&CAMPAIGNS)
            .unwrap_or(Map::new(&env));

        // Check if campaign already exists
        if campaigns.contains_key(campaign_id.clone()) {
            return Err(Error::CampaignExists);
        }

        // Create campaign
        let campaign = Campaign {
            campaign_id: campaign_id.clone(),
            ngo_address: ngo_address.clone(),
            target_amount,
            control_mode: control_mode.clone(),
            created_at: env.ledger().timestamp(),
            status: String::from_str(&env, "ACTIVE"),
        };

        // Store campaign
        campaigns.set(campaign_id.clone(), campaign);
        env.storage().instance().set(&CAMPAIGNS, &campaigns);

        // Initialize campaign balance
        let mut balances: Map<String, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        balances.set(campaign_id.clone(), 0);
        env.storage().instance().set(&BALANCES, &balances);

        // Emit event
        event::emit_campaign_created(&env, campaign_id, ngo_address, target_amount, control_mode);

        Ok(())
    }

    /// Donate USDC to a campaign
    pub fn donate(
        env: Env,
        donor: Address,
        campaign_id: String,
        amount: i128,
    ) -> Result<(), Error> {
        donor.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Get campaign
        let campaigns: Map<String, Campaign> = env.storage()
            .instance()
            .get(&CAMPAIGNS)
            .unwrap_or(Map::new(&env));
        
        let campaign = campaigns.get(campaign_id.clone())
            .ok_or(Error::CampaignNotFound)?;

        // Check campaign is active
        if campaign.status != String::from_str(&env, "ACTIVE") {
            return Err(Error::Unauthorized);
        }

        // Get USDC token client
        let usdc_address: Address = env.storage().instance().get(&USDC_TOKEN).unwrap();
        let token = TokenClient::new(&env, &usdc_address);

        // Get vault address (this contract)
        let vault_address = env.current_contract_address();

        // Transfer USDC from donor to vault
        token.transfer(&donor, &vault_address, amount)?;

        // Update campaign balance
        let mut balances: Map<String, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        
        let current_balance = balances.get(campaign_id.clone()).unwrap_or(0);
        balances.set(campaign_id.clone(), current_balance + amount);
        env.storage().instance().set(&BALANCES, &balances);

        // Emit event
        event::emit_donation_received(&env, campaign_id, donor, amount);

        Ok(())
    }

    /// Allocate funds to a beneficiary
    pub fn allocate_to_beneficiary(
        env: Env,
        ngo_address: Address,
        campaign_id: String,
        beneficiary_address: Address,
        amount: i128,
        control_mode: String,
        categories: Vec<String>,
        category_limits: Map<String, i128>,
    ) -> Result<(), Error> {
        ngo_address.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Get campaign
        let campaigns: Map<String, Campaign> = env.storage()
            .instance()
            .get(&CAMPAIGNS)
            .unwrap_or(Map::new(&env));
        
        let campaign = campaigns.get(campaign_id.clone())
            .ok_or(Error::CampaignNotFound)?;

        // Verify caller is NGO for this campaign
        if campaign.ngo_address != ngo_address {
            return Err(Error::Unauthorized);
        }

        // Check campaign has sufficient funds
        let balances: Map<String, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        
        let campaign_balance = balances.get(campaign_id.clone()).unwrap_or(0);
        if campaign_balance < amount {
            return Err(Error::InsufficientBalance);
        }

        // Create allocation
        let mut allocations: Map<Address, BeneficiaryAllocation> = env.storage()
            .instance()
            .get(&ALLOCATIONS)
            .unwrap_or(Map::new(&env));

        let allocation = BeneficiaryAllocation {
            beneficiary: beneficiary_address.clone(),
            campaign_id: campaign_id.clone(),
            total_amount: amount,
            spent: 0,
            control_mode: control_mode.clone(),
            categories: categories.clone(),
            category_limits: category_limits.clone(),
            category_spent: Map::new(&env),
        };

        allocations.set(beneficiary_address.clone(), allocation);
        env.storage().instance().set(&ALLOCATIONS, &allocations);

        // Emit event
        event::emit_funds_allocated(&env, campaign_id, beneficiary_address, amount);

        Ok(())
    }

    /// Authorize spending (Controlled Mode)
    pub fn authorize_spending(
        env: Env,
        beneficiary: Address,
        merchant: Address,
        amount: i128,
        category: String,
    ) -> Result<u64, Error> {
        beneficiary.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Get beneficiary allocation
        let allocations: Map<Address, BeneficiaryAllocation> = env.storage()
            .instance()
            .get(&ALLOCATIONS)
            .unwrap_or(Map::new(&env));
        
        let allocation = allocations.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Check if controlled mode
        if allocation.control_mode != String::from_str(&env, "CONTROLLED") {
            return Err(Error::InvalidControlMode);
        }

        // Check beneficiary has sufficient balance
        let remaining = allocation.total_amount - allocation.spent;
        if remaining < amount {
            return Err(Error::InsufficientBalance);
        }

        // Check category limit
        if let Some(limit) = allocation.category_limits.get(category.clone()) {
            let spent = allocation.category_spent.get(category.clone()).unwrap_or(0);
            if spent + amount > limit {
                return Err(Error::CategoryLimitExceeded);
            }
        } else {
            return Err(Error::CategoryLimitExceeded);
        }

        // Generate authorization ID
        let auth_counter: u64 = env.storage().instance().get(&AUTH_COUNTER).unwrap_or(0);
        let auth_id = auth_counter + 1;
        env.storage().instance().set(&AUTH_COUNTER, &auth_id);

        // Create authorization
        let authorization = SpendingAuthorization {
            auth_id,
            beneficiary: beneficiary.clone(),
            merchant: merchant.clone(),
            amount,
            category: category.clone(),
            created_at: env.ledger().timestamp(),
            status: String::from_str(&env, "PENDING"),
        };

        // Store authorization
        let mut auths: Map<u64, SpendingAuthorization> = env.storage()
            .instance()
            .get(&AUTHS)
            .unwrap_or(Map::new(&env));
        auths.set(auth_id, authorization);
        env.storage().instance().set(&AUTHS, &auths);

        // Emit event
        let category_symbol = symbol_short!("spending");
        event::emit_spending_authorized(&env, beneficiary, merchant, category_symbol, amount);

        Ok(auth_id)
    }

    /// Execute authorized spending
    pub fn execute_spending(
        env: Env,
        auth_id: u64,
    ) -> Result<(), Error> {
        // Get authorization
        let mut auths: Map<u64, SpendingAuthorization> = env.storage()
            .instance()
            .get(&AUTHS)
            .unwrap_or(Map::new(&env));
        
        let mut authorization = auths.get(auth_id)
            .ok_or(Error::AuthorizationNotFound)?;

        // Check if already executed
        if authorization.status != String::from_str(&env, "PENDING") {
            return Err(Error::Unauthorized);
        }

        // Get USDC token client
        let usdc_address: Address = env.storage().instance().get(&USDC_TOKEN).unwrap();
        let token = TokenClient::new(&env, &usdc_address);

        // Get vault address
        let vault_address = env.current_contract_address();

        // Transfer USDC to merchant
        token.transfer(&vault_address, &authorization.merchant, authorization.amount)?;

        // Update beneficiary allocation
        let mut allocations: Map<Address, BeneficiaryAllocation> = env.storage()
            .instance()
            .get(&ALLOCATIONS)
            .unwrap_or(Map::new(&env));
        
        let mut allocation = allocations.get(authorization.beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        allocation.spent += authorization.amount;
        
        // Update category spent
        let category_spent = allocation.category_spent.get(authorization.category.clone()).unwrap_or(0);
        allocation.category_spent.set(authorization.category.clone(), category_spent + authorization.amount);
        
        allocations.set(authorization.beneficiary.clone(), allocation.clone());
        env.storage().instance().set(&ALLOCATIONS, &allocations);

        // Mark authorization as executed
        authorization.status = String::from_str(&env, "EXECUTED");
        auths.set(auth_id, authorization.clone());
        env.storage().instance().set(&AUTHS, &auths);

        // Emit event
        let remaining_balance = allocation.total_amount - allocation.spent;
        let category_symbol = symbol_short!("txn");
        event::emit_transaction_executed(
            &env,
            authorization.beneficiary,
            authorization.merchant,
            category_symbol,
            authorization.amount,
            remaining_balance,
        );

        Ok(())
    }

    /// Get campaign balance
    pub fn get_campaign_balance(
        env: Env,
        campaign_id: String,
    ) -> i128 {
        let balances: Map<String, i128> = env.storage()
            .instance()
            .get(&BALANCES)
            .unwrap_or(Map::new(&env));
        
        balances.get(campaign_id).unwrap_or(0)
    }

    /// Get beneficiary allocation
    pub fn get_beneficiary_balance(
        env: Env,
        beneficiary_address: Address,
    ) -> i128 {
        let allocations: Map<Address, BeneficiaryAllocation> = env.storage()
            .instance()
            .get(&ALLOCATIONS)
            .unwrap_or(Map::new(&env));
        
        if let Some(allocation) = allocations.get(beneficiary_address) {
            allocation.total_amount - allocation.spent
        } else {
            0
        }
    }

    /// Get category spent amount
    pub fn get_category_spent(
        env: Env,
        beneficiary_address: Address,
        category: String,
    ) -> i128 {
        let allocations: Map<Address, BeneficiaryAllocation> = env.storage()
            .instance()
            .get(&ALLOCATIONS)
            .unwrap_or(Map::new(&env));
        
        if let Some(allocation) = allocations.get(beneficiary_address) {
            allocation.category_spent.get(category).unwrap_or(0)
        } else {
            0
        }
    }

    /// Get authorization status
    pub fn get_authorization_status(
        env: Env,
        auth_id: u64,
    ) -> u32 {
        let auths: Map<u64, SpendingAuthorization> = env.storage()
            .instance()
            .get(&AUTHS)
            .unwrap_or(Map::new(&env));
        
        if let Some(auth) = auths.get(auth_id) {
            if auth.status == String::from_str(&env, "PENDING") {
                0 // Pending
            } else if auth.status == String::from_str(&env, "EXECUTED") {
                1 // Executed
            } else {
                2 // Cancelled
            }
        } else {
            3 // Not found
        }
    }
}
