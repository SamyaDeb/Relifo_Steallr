use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Symbol, symbol_short, Vec};
use crate::error::Error;
use crate::event;

// Storage keys (max 9 chars for symbol_short!)
const ADMIN: Symbol = symbol_short!("ADMIN");
const MERCHANTS: Symbol = symbol_short!("MERCHANTS");
const INIT: Symbol = symbol_short!("INIT");

/// Merchant Status enum
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum MerchantStatus {
    Pending = 0,
    Approved = 1,
    Suspended = 2,
    Revoked = 3,
}

/// Merchant Information structure
#[derive(Clone)]
#[contracttype]
pub struct MerchantInfo {
    pub address: Address,
    pub name: String,
    pub approved_categories: Vec<Symbol>,
    pub status: MerchantStatus,
    pub registered_at: u64,
    pub total_received: i128,
    pub transaction_count: u32,
}

/// Merchant Registry Contract
/// Manages approved merchants for Controlled Mode spending
#[contract]
pub struct MerchantRegistry;

#[contractimpl]
impl MerchantRegistry {
    /// Initialize the merchant registry
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&INIT) {
            return Err(Error::AlreadyInitialized);
        }

        // Require admin authentication
        admin.require_auth();

        // Store admin
        env.storage().instance().set(&ADMIN, &admin);

        // Initialize empty merchant map
        let merchants: Map<Address, MerchantInfo> = Map::new(&env);
        env.storage().instance().set(&MERCHANTS, &merchants);

        // Mark as initialized
        env.storage().instance().set(&INIT, &true);

        Ok(())
    }

    /// Register a new merchant (admin only)
    pub fn register_merchant(
        env: Env,
        merchant_address: Address,
        name: String,
        categories: Vec<Symbol>,
    ) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .unwrap_or(Map::new(&env));

        // Check if already registered
        if merchants.contains_key(merchant_address.clone()) {
            return Err(Error::AlreadyInitialized);
        }

        // Create merchant info
        let merchant_info = MerchantInfo {
            address: merchant_address.clone(),
            name: name.clone(),
            approved_categories: categories,
            status: MerchantStatus::Approved,
            registered_at: env.ledger().timestamp(),
            total_received: 0,
            transaction_count: 0,
        };

        // Store merchant
        merchants.set(merchant_address.clone(), merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        // Emit registration event
        let categories_str = String::from_str(&env, "multiple");
        event::emit_merchant_registered(&env, merchant_address, name, categories_str);

        Ok(())
    }

    /// Merchant self-registration (pending approval)
    pub fn register_merchant_pending(
        env: Env,
        name: String,
        categories: Vec<Symbol>,
    ) -> Result<(), Error> {
        // Get caller as merchant address
        let merchant_address = env.current_contract_address();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .unwrap_or(Map::new(&env));

        // Check if already registered
        if merchants.contains_key(merchant_address.clone()) {
            return Err(Error::AlreadyInitialized);
        }

        // Create merchant info (pending)
        let merchant_info = MerchantInfo {
            address: merchant_address.clone(),
            name: name.clone(),
            approved_categories: categories,
            status: MerchantStatus::Pending,
            registered_at: env.ledger().timestamp(),
            total_received: 0,
            transaction_count: 0,
        };

        // Store merchant
        merchants.set(merchant_address.clone(), merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        // Emit registration event
        let categories_str = String::from_str(&env, "pending");
        event::emit_merchant_registered(&env, merchant_address, name, categories_str);

        Ok(())
    }

    /// Approve a pending merchant (admin only)
    pub fn approve_merchant(env: Env, merchant_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        // Get merchant info
        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        // Update status
        merchant_info.status = MerchantStatus::Approved;

        // Save updated info
        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Add category approval to merchant (admin only)
    pub fn approve_for_category(
        env: Env,
        merchant_address: Address,
        category: Symbol,
    ) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        // Get merchant info
        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        // Check if category already exists
        let mut has_category = false;
        for cat in merchant_info.approved_categories.iter() {
            if cat == category {
                has_category = true;
                break;
            }
        }

        // Add category if not exists
        if !has_category {
            merchant_info.approved_categories.push_back(category);
        }

        // Save updated info
        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Remove category from merchant (admin only)
    pub fn remove_category(
        env: Env,
        merchant_address: Address,
        category: Symbol,
    ) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        // Get merchant info
        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        // Create new categories without the removed one
        let mut new_categories: Vec<Symbol> = Vec::new(&env);
        for cat in merchant_info.approved_categories.iter() {
            if cat != category {
                new_categories.push_back(cat);
            }
        }
        merchant_info.approved_categories = new_categories;

        // Save updated info
        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Check if merchant is approved for category
    pub fn is_approved_for_category(
        env: Env,
        merchant_address: Address,
        category: Symbol,
    ) -> bool {
        let merchants: Map<Address, MerchantInfo> = match env.storage().instance().get(&MERCHANTS) {
            Some(m) => m,
            None => return false,
        };

        let merchant_info = match merchants.get(merchant_address) {
            Some(m) => m,
            None => return false,
        };

        // Check if merchant is approved and has the category
        if merchant_info.status != MerchantStatus::Approved {
            return false;
        }

        for cat in merchant_info.approved_categories.iter() {
            if cat == category {
                return true;
            }
        }
        false
    }

    /// Check if merchant is approved (any status)
    pub fn is_approved(env: Env, merchant_address: Address) -> bool {
        let merchants: Map<Address, MerchantInfo> = match env.storage().instance().get(&MERCHANTS) {
            Some(m) => m,
            None => return false,
        };

        match merchants.get(merchant_address) {
            Some(info) => info.status == MerchantStatus::Approved,
            None => false,
        }
    }

    /// Revoke merchant (admin only)
    pub fn revoke_merchant(env: Env, merchant_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        // Get merchant info
        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        // Update status
        merchant_info.status = MerchantStatus::Revoked;

        // Save updated info
        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Suspend merchant (admin only)
    pub fn suspend_merchant(env: Env, merchant_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get merchant map
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        // Get merchant info
        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        // Update status
        merchant_info.status = MerchantStatus::Suspended;

        // Save updated info
        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Get merchant info
    pub fn get_merchant_info(env: Env, merchant_address: Address) -> Option<MerchantInfo> {
        let merchants: Map<Address, MerchantInfo> = env.storage().instance().get(&MERCHANTS)?;
        merchants.get(merchant_address)
    }

    /// Update merchant received amount (called after transaction)
    pub fn update_received(
        env: Env,
        merchant_address: Address,
        amount: i128,
    ) -> Result<(), Error> {
        let mut merchants: Map<Address, MerchantInfo> = env.storage()
            .instance()
            .get(&MERCHANTS)
            .ok_or(Error::MerchantNotApproved)?;

        let mut merchant_info = merchants.get(merchant_address.clone())
            .ok_or(Error::MerchantNotApproved)?;

        merchant_info.total_received += amount;
        merchant_info.transaction_count += 1;

        merchants.set(merchant_address, merchant_info);
        env.storage().instance().set(&MERCHANTS, &merchants);

        Ok(())
    }

    /// Get all merchants
    pub fn get_all_merchants(env: Env) -> Vec<MerchantInfo> {
        let merchants: Map<Address, MerchantInfo> = match env.storage().instance().get(&MERCHANTS) {
            Some(m) => m,
            None => return Vec::new(&env),
        };

        let mut result: Vec<MerchantInfo> = Vec::new(&env);
        for (_, info) in merchants.iter() {
            result.push_back(info);
        }
        result
    }

    /// Get merchants by category
    pub fn get_merchants_by_category(env: Env, category: Symbol) -> Vec<MerchantInfo> {
        let merchants: Map<Address, MerchantInfo> = match env.storage().instance().get(&MERCHANTS) {
            Some(m) => m,
            None => return Vec::new(&env),
        };

        let mut result: Vec<MerchantInfo> = Vec::new(&env);
        for (_, info) in merchants.iter() {
            if info.status == MerchantStatus::Approved {
                for cat in info.approved_categories.iter() {
                    if cat == category {
                        result.push_back(info.clone());
                        break;
                    }
                }
            }
        }
        result
    }

    /// Get pending merchants for admin review
    pub fn get_pending_merchants(env: Env) -> Vec<MerchantInfo> {
        let merchants: Map<Address, MerchantInfo> = match env.storage().instance().get(&MERCHANTS) {
            Some(m) => m,
            None => return Vec::new(&env),
        };

        let mut result: Vec<MerchantInfo> = Vec::new(&env);
        for (_, info) in merchants.iter() {
            if info.status == MerchantStatus::Pending {
                result.push_back(info);
            }
        }
        result
    }
}
