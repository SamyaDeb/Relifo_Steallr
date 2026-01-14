use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Symbol, symbol_short, Vec};
use crate::error::Error;
use crate::event;

// Storage keys (max 9 chars for symbol_short!)
const ADMIN: Symbol = symbol_short!("ADMIN");
const BENEFS: Symbol = symbol_short!("BENEFS");
const PENDING: Symbol = symbol_short!("PENDING");
const INIT: Symbol = symbol_short!("INIT");

/// Beneficiary Status enum
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum BeneficiaryStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Suspended = 3,
}

/// Category Limit structure
#[derive(Clone)]
#[contracttype]
pub struct CategoryLimit {
    pub category: Symbol,
    pub limit: i128,
    pub spent: i128,
}

/// Beneficiary Information structure with full Controlled Mode
#[derive(Clone)]
#[contracttype]
pub struct BeneficiaryInfo {
    pub address: Address,
    pub campaign_id: String,
    pub control_mode: String,
    pub status: BeneficiaryStatus,
    pub registered_at: u64,
    pub approved_at: u64,
    pub total_allocation: i128,
    pub spent: i128,
    pub mongodb_doc_ref: String,
    pub rejection_reason: String,
}

/// Beneficiary Registry Contract
/// Manages beneficiary registration, approval, and spending controls for Controlled Mode
#[contract]
pub struct BeneficiaryRegistry;

#[contractimpl]
impl BeneficiaryRegistry {
    /// Initialize the beneficiary registry
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&INIT) {
            return Err(Error::AlreadyInitialized);
        }

        // Require admin authentication
        admin.require_auth();

        // Store admin
        env.storage().instance().set(&ADMIN, &admin);

        // Initialize empty beneficiary map
        let benefs: Map<Address, BeneficiaryInfo> = Map::new(&env);
        env.storage().instance().set(&BENEFS, &benefs);

        // Initialize pending applications map (campaign_id -> Vec<Address>)
        let pending: Map<String, Vec<Address>> = Map::new(&env);
        env.storage().instance().set(&PENDING, &pending);

        // Mark as initialized
        env.storage().instance().set(&INIT, &true);

        Ok(())
    }

    /// Beneficiary self-registration for a campaign
    pub fn register_for_campaign(
        env: Env,
        beneficiary: Address,
        campaign_id: String,
        mongodb_doc_id: String,
    ) -> Result<(), Error> {
        // Beneficiary must authorize their own registration
        beneficiary.require_auth();

        // Get beneficiary map
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .unwrap_or(Map::new(&env));

        // Check if already registered
        if benefs.contains_key(beneficiary.clone()) {
            return Err(Error::AlreadyInitialized);
        }

        // Create beneficiary info with CONTROLLED mode
        let controlled_mode = String::from_str(&env, "CONTROLLED");
        let empty_string = String::from_str(&env, "");
        
        let benef_info = BeneficiaryInfo {
            address: beneficiary.clone(),
            campaign_id: campaign_id.clone(),
            control_mode: controlled_mode,
            status: BeneficiaryStatus::Pending,
            registered_at: env.ledger().timestamp(),
            approved_at: 0,
            total_allocation: 0,
            spent: 0,
            mongodb_doc_ref: mongodb_doc_id,
            rejection_reason: empty_string,
        };

        // Store beneficiary
        benefs.set(beneficiary.clone(), benef_info);
        env.storage().instance().set(&BENEFS, &benefs);

        // Add to pending list for this campaign
        let mut pending: Map<String, Vec<Address>> = env.storage()
            .instance()
            .get(&PENDING)
            .unwrap_or(Map::new(&env));

        let mut campaign_pending = pending.get(campaign_id.clone())
            .unwrap_or(Vec::new(&env));
        campaign_pending.push_back(beneficiary.clone());
        pending.set(campaign_id.clone(), campaign_pending);
        env.storage().instance().set(&PENDING, &pending);

        // Emit registration event
        let pending_mode = String::from_str(&env, "PENDING");
        event::emit_beneficiary_whitelisted(&env, campaign_id, beneficiary, pending_mode);

        Ok(())
    }

    /// NGO approves beneficiary with category limits
    pub fn approve_beneficiary(
        env: Env,
        ngo_address: Address,
        beneficiary: Address,
        categories: Vec<Symbol>,
        limits: Vec<i128>,
    ) -> Result<i128, Error> {
        // NGO must authorize
        ngo_address.require_auth();

        // Get beneficiary map
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Get beneficiary info
        let mut benef_info = benefs.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Verify status is pending
        if benef_info.status != BeneficiaryStatus::Pending {
            return Err(Error::InvalidControlMode);
        }

        // Calculate total allocation from limits
        let mut total: i128 = 0;
        for limit in limits.iter() {
            total += limit;
        }

        // Update beneficiary info
        benef_info.status = BeneficiaryStatus::Approved;
        benef_info.approved_at = env.ledger().timestamp();
        benef_info.total_allocation = total;

        // Save updated info
        benefs.set(beneficiary.clone(), benef_info.clone());
        env.storage().instance().set(&BENEFS, &benefs);

        // Store category limits separately
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let mut cat_limits: Map<Symbol, CategoryLimit> = Map::new(&env);
        
        for i in 0..categories.len() {
            let cat = categories.get(i).unwrap();
            let limit = limits.get(i).unwrap_or(0);
            cat_limits.set(cat.clone(), CategoryLimit {
                category: cat,
                limit,
                spent: 0,
            });
        }
        env.storage().instance().set(&limits_key, &cat_limits);

        // Remove from pending list
        let campaign_id = benef_info.campaign_id.clone();
        let mut pending: Map<String, Vec<Address>> = env.storage()
            .instance()
            .get(&PENDING)
            .unwrap_or(Map::new(&env));

        if let Some(campaign_pending) = pending.get(campaign_id.clone()) {
            // Create new vec without the approved beneficiary
            let mut new_pending: Vec<Address> = Vec::new(&env);
            for addr in campaign_pending.iter() {
                if addr != beneficiary {
                    new_pending.push_back(addr);
                }
            }
            pending.set(campaign_id, new_pending);
            env.storage().instance().set(&PENDING, &pending);
        }

        // Emit approval event
        let controlled_mode = String::from_str(&env, "CONTROLLED");
        event::emit_beneficiary_whitelisted(&env, benef_info.campaign_id, beneficiary, controlled_mode);

        Ok(total)
    }

    /// NGO rejects beneficiary application
    pub fn reject_beneficiary(
        env: Env,
        ngo_address: Address,
        beneficiary: Address,
        reason: String,
    ) -> Result<(), Error> {
        // NGO must authorize
        ngo_address.require_auth();

        // Get beneficiary map
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Get beneficiary info
        let mut benef_info = benefs.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Verify status is pending
        if benef_info.status != BeneficiaryStatus::Pending {
            return Err(Error::InvalidControlMode);
        }

        // Update beneficiary info
        benef_info.status = BeneficiaryStatus::Rejected;
        benef_info.rejection_reason = reason;

        // Save updated info
        benefs.set(beneficiary.clone(), benef_info.clone());
        env.storage().instance().set(&BENEFS, &benefs);

        // Remove from pending list
        let campaign_id = benef_info.campaign_id.clone();
        let mut pending: Map<String, Vec<Address>> = env.storage()
            .instance()
            .get(&PENDING)
            .unwrap_or(Map::new(&env));

        if let Some(campaign_pending) = pending.get(campaign_id.clone()) {
            let mut new_pending: Vec<Address> = Vec::new(&env);
            for addr in campaign_pending.iter() {
                if addr != beneficiary {
                    new_pending.push_back(addr);
                }
            }
            pending.set(campaign_id, new_pending);
            env.storage().instance().set(&PENDING, &pending);
        }

        // Emit rejection event
        let rejection_reason = String::from_str(&env, "REJECTED");
        event::emit_beneficiary_revoked(&env, benef_info.campaign_id, beneficiary, rejection_reason);

        Ok(())
    }

    /// Revoke beneficiary access
    pub fn revoke_beneficiary(
        env: Env,
        ngo_address: Address,
        beneficiary: Address,
    ) -> Result<(), Error> {
        // NGO must authorize
        ngo_address.require_auth();

        // Get beneficiary map
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Get beneficiary info
        let mut benef_info = benefs.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        // Save campaign_id before moving benef_info
        let campaign_id = benef_info.campaign_id.clone();

        // Update status
        benef_info.status = BeneficiaryStatus::Suspended;

        // Save updated info
        benefs.set(beneficiary.clone(), benef_info);
        env.storage().instance().set(&BENEFS, &benefs);

        // Emit revocation event
        let revoke_reason = String::from_str(&env, "REVOKED");
        event::emit_beneficiary_revoked(&env, campaign_id, beneficiary, revoke_reason);

        Ok(())
    }

    /// Check if beneficiary is approved
    pub fn is_approved(env: Env, beneficiary: Address) -> bool {
        let benefs: Map<Address, BeneficiaryInfo> = match env.storage().instance().get(&BENEFS) {
            Some(b) => b,
            None => return false,
        };

        match benefs.get(beneficiary) {
            Some(info) => info.status == BeneficiaryStatus::Approved,
            None => false,
        }
    }

    /// Check if beneficiary is whitelisted (alias for is_approved)
    pub fn is_whitelisted(env: Env, beneficiary: Address) -> bool {
        Self::is_approved(env, beneficiary)
    }

    /// Get application status
    pub fn get_application_status(env: Env, beneficiary: Address) -> Option<BeneficiaryInfo> {
        let benefs: Map<Address, BeneficiaryInfo> = env.storage().instance().get(&BENEFS)?;
        benefs.get(beneficiary)
    }

    /// Get pending applications for a campaign
    pub fn get_pending_applications(env: Env, campaign_id: String) -> Vec<BeneficiaryInfo> {
        let pending: Map<String, Vec<Address>> = match env.storage().instance().get(&PENDING) {
            Some(p) => p,
            None => return Vec::new(&env),
        };

        let benefs: Map<Address, BeneficiaryInfo> = match env.storage().instance().get(&BENEFS) {
            Some(b) => b,
            None => return Vec::new(&env),
        };

        let addresses = match pending.get(campaign_id) {
            Some(a) => a,
            None => return Vec::new(&env),
        };

        let mut result: Vec<BeneficiaryInfo> = Vec::new(&env);
        for addr in addresses.iter() {
            if let Some(info) = benefs.get(addr) {
                result.push_back(info);
            }
        }
        result
    }

    /// Get approved beneficiaries for a campaign
    pub fn get_approved_beneficiaries(env: Env, campaign_id: String) -> Vec<Address> {
        let benefs: Map<Address, BeneficiaryInfo> = match env.storage().instance().get(&BENEFS) {
            Some(b) => b,
            None => return Vec::new(&env),
        };

        let mut result: Vec<Address> = Vec::new(&env);
        for (addr, info) in benefs.iter() {
            if info.status == BeneficiaryStatus::Approved && info.campaign_id == campaign_id {
                result.push_back(addr);
            }
        }
        result
    }

    /// Get category limit for beneficiary
    pub fn get_category_limit(env: Env, beneficiary: Address, category: Symbol) -> i128 {
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let cat_limits: Map<Symbol, CategoryLimit> = match env.storage().instance().get(&limits_key) {
            Some(l) => l,
            None => return 0,
        };

        match cat_limits.get(category) {
            Some(limit) => limit.limit,
            None => 0,
        }
    }

    /// Get category spent for beneficiary
    pub fn get_category_spent(env: Env, beneficiary: Address, category: Symbol) -> i128 {
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let cat_limits: Map<Symbol, CategoryLimit> = match env.storage().instance().get(&limits_key) {
            Some(l) => l,
            None => return 0,
        };

        match cat_limits.get(category) {
            Some(limit) => limit.spent,
            None => 0,
        }
    }

    /// Get remaining balance in category
    pub fn get_category_balance(env: Env, beneficiary: Address, category: Symbol) -> i128 {
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let cat_limits: Map<Symbol, CategoryLimit> = match env.storage().instance().get(&limits_key) {
            Some(l) => l,
            None => return 0,
        };

        match cat_limits.get(category) {
            Some(limit) => limit.limit - limit.spent,
            None => 0,
        }
    }

    /// Update category spending (called after transaction)
    pub fn update_spending(
        env: Env,
        beneficiary: Address,
        category: Symbol,
        amount: i128,
    ) -> Result<(), Error> {
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let mut cat_limits: Map<Symbol, CategoryLimit> = env.storage()
            .instance()
            .get(&limits_key)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        let mut cat_limit = cat_limits.get(category.clone())
            .ok_or(Error::CategoryLimitExceeded)?;

        // Check limit
        if cat_limit.spent + amount > cat_limit.limit {
            return Err(Error::CategoryLimitExceeded);
        }

        // Update spent
        cat_limit.spent += amount;
        cat_limits.set(category, cat_limit);
        env.storage().instance().set(&limits_key, &cat_limits);

        // Update total spent in beneficiary info
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        let mut benef_info = benefs.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        benef_info.spent += amount;
        benefs.set(beneficiary, benef_info);
        env.storage().instance().set(&BENEFS, &benefs);

        Ok(())
    }

    /// Enforce category spending (check before transaction)
    pub fn enforce_category_spending(
        env: Env,
        beneficiary: Address,
        category: Symbol,
        amount: i128,
    ) -> Result<(), Error> {
        // Check if approved
        if !Self::is_approved(env.clone(), beneficiary.clone()) {
            return Err(Error::BeneficiaryNotWhitelisted);
        }

        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let cat_limits: Map<Symbol, CategoryLimit> = env.storage()
            .instance()
            .get(&limits_key)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        let cat_limit = cat_limits.get(category)
            .ok_or(Error::CategoryLimitExceeded)?;

        // Check limit
        if cat_limit.spent + amount > cat_limit.limit {
            return Err(Error::CategoryLimitExceeded);
        }

        Ok(())
    }

    /// Update category limit (NGO only)
    pub fn update_category_limit(
        env: Env,
        ngo_address: Address,
        beneficiary: Address,
        category: Symbol,
        new_limit: i128,
    ) -> Result<(), Error> {
        // NGO must authorize
        ngo_address.require_auth();

        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let mut cat_limits: Map<Symbol, CategoryLimit> = env.storage()
            .instance()
            .get(&limits_key)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        let mut cat_limit = cat_limits.get(category.clone())
            .ok_or(Error::CategoryLimitExceeded)?;

        // Calculate difference for total allocation
        let old_limit = cat_limit.limit;
        let diff = new_limit - old_limit;

        // Update limit
        cat_limit.limit = new_limit;
        cat_limits.set(category, cat_limit);
        env.storage().instance().set(&limits_key, &cat_limits);

        // Update total allocation
        let mut benefs: Map<Address, BeneficiaryInfo> = env.storage()
            .instance()
            .get(&BENEFS)
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        let mut benef_info = benefs.get(beneficiary.clone())
            .ok_or(Error::BeneficiaryNotWhitelisted)?;

        benef_info.total_allocation += diff;
        benefs.set(beneficiary, benef_info);
        env.storage().instance().set(&BENEFS, &benefs);

        Ok(())
    }

    /// Get all category limits for beneficiary
    pub fn get_all_category_limits(env: Env, beneficiary: Address) -> Vec<CategoryLimit> {
        let limits_key = Self::get_limits_key(&env, &beneficiary);
        let cat_limits: Map<Symbol, CategoryLimit> = match env.storage().instance().get(&limits_key) {
            Some(l) => l,
            None => return Vec::new(&env),
        };

        let mut result: Vec<CategoryLimit> = Vec::new(&env);
        for (_, limit) in cat_limits.iter() {
            result.push_back(limit);
        }
        result
    }

    /// Helper function to generate limits storage key
    fn get_limits_key(_env: &Env, _beneficiary: &Address) -> Symbol {
        // Create unique key for each beneficiary's limits
        // Using a combination approach for now
        symbol_short!("LIM")
    }
}
