use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Map, String, Symbol, symbol_short, Vec};
use crate::error::Error;
use crate::event;

// Storage keys (max 9 chars for symbol_short!)
const ADMIN: Symbol = symbol_short!("ADMIN");
const NGOS: Symbol = symbol_short!("NGOS");
const INIT: Symbol = symbol_short!("INIT");

/// NGO Status enum
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum NGOStatus {
    Pending = 0,
    Verified = 1,
    Suspended = 2,
    Revoked = 3,
}

/// NGO Information structure
#[derive(Clone)]
#[contracttype]
pub struct NGOInfo {
    pub address: Address,
    pub name: String,
    pub registration_number: String,
    pub country: String,
    pub status: NGOStatus,
    pub registered_at: u64,
    pub verified_at: u64,
    pub total_campaigns: u32,
}

/// NGO Registry Contract
/// Manages NGO registration and verification
#[contract]
pub struct NGORegistry;

#[contractimpl]
impl NGORegistry {
    /// Initialize the NGO registry
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if already initialized
        if env.storage().instance().has(&INIT) {
            return Err(Error::AlreadyInitialized);
        }

        // Require admin authentication
        admin.require_auth();

        // Store admin
        env.storage().instance().set(&ADMIN, &admin);

        // Initialize empty NGO map
        let ngos: Map<Address, NGOInfo> = Map::new(&env);
        env.storage().instance().set(&NGOS, &ngos);

        // Mark as initialized
        env.storage().instance().set(&INIT, &true);

        Ok(())
    }

    /// Register a new NGO (self-registration)
    pub fn register_ngo(
        env: Env,
        name: String,
        registration_number: String,
        country: String,
    ) -> Result<(), Error> {
        // Get caller as the NGO address
        let ngo_address = env.current_contract_address();
        
        // For demo, we use a simpler approach - caller registers themselves
        // In production, you'd use invoker address

        // Get NGO map
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .unwrap_or(Map::new(&env));

        // Check if already registered
        if ngos.contains_key(ngo_address.clone()) {
            return Err(Error::AlreadyInitialized);
        }

        // Create NGO info
        let ngo_info = NGOInfo {
            address: ngo_address.clone(),
            name: name.clone(),
            registration_number,
            country: country.clone(),
            status: NGOStatus::Pending,
            registered_at: env.ledger().timestamp(),
            verified_at: 0,
            total_campaigns: 0,
        };

        // Store NGO
        ngos.set(ngo_address.clone(), ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        // Emit registration event
        event::emit_ngo_registered(&env, ngo_address, name, country);

        Ok(())
    }

    /// Register NGO with specific address (for external callers)
    pub fn register_ngo_with_address(
        env: Env,
        ngo_address: Address,
        name: String,
        registration_number: String,
        country: String,
    ) -> Result<(), Error> {
        // NGO must authorize their own registration
        ngo_address.require_auth();

        // Get NGO map
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .unwrap_or(Map::new(&env));

        // Check if already registered
        if ngos.contains_key(ngo_address.clone()) {
            return Err(Error::AlreadyInitialized);
        }

        // Create NGO info
        let ngo_info = NGOInfo {
            address: ngo_address.clone(),
            name: name.clone(),
            registration_number,
            country: country.clone(),
            status: NGOStatus::Pending,
            registered_at: env.ledger().timestamp(),
            verified_at: 0,
            total_campaigns: 0,
        };

        // Store NGO
        ngos.set(ngo_address.clone(), ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        // Emit registration event
        event::emit_ngo_registered(&env, ngo_address, name, country);

        Ok(())
    }

    /// Verify an NGO (admin only)
    pub fn verify_ngo(env: Env, ngo_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get NGO map
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .ok_or(Error::NGONotRegistered)?;

        // Get NGO info
        let mut ngo_info = ngos.get(ngo_address.clone())
            .ok_or(Error::NGONotRegistered)?;

        // Update status
        ngo_info.status = NGOStatus::Verified;
        ngo_info.verified_at = env.ledger().timestamp();

        // Save updated info
        ngos.set(ngo_address.clone(), ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        // Emit verification event
        event::emit_ngo_verified(&env, ngo_address, admin);

        Ok(())
    }

    /// Revoke an NGO (admin only)
    pub fn revoke_ngo(env: Env, ngo_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get NGO map
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .ok_or(Error::NGONotRegistered)?;

        // Get NGO info
        let mut ngo_info = ngos.get(ngo_address.clone())
            .ok_or(Error::NGONotRegistered)?;

        // Update status
        ngo_info.status = NGOStatus::Revoked;

        // Save updated info
        ngos.set(ngo_address.clone(), ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        Ok(())
    }

    /// Suspend an NGO (admin only)
    pub fn suspend_ngo(env: Env, ngo_address: Address) -> Result<(), Error> {
        // Get and verify admin
        let admin: Address = env.storage()
            .instance()
            .get(&ADMIN)
            .ok_or(Error::Unauthorized)?;
        admin.require_auth();

        // Get NGO map
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .ok_or(Error::NGONotRegistered)?;

        // Get NGO info
        let mut ngo_info = ngos.get(ngo_address.clone())
            .ok_or(Error::NGONotRegistered)?;

        // Update status
        ngo_info.status = NGOStatus::Suspended;

        // Save updated info
        ngos.set(ngo_address.clone(), ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        Ok(())
    }

    /// Check if NGO is verified
    pub fn is_verified(env: Env, ngo_address: Address) -> bool {
        let ngos: Map<Address, NGOInfo> = match env.storage().instance().get(&NGOS) {
            Some(n) => n,
            None => return false,
        };

        match ngos.get(ngo_address) {
            Some(info) => info.status == NGOStatus::Verified,
            None => false,
        }
    }

    /// Get NGO status
    pub fn get_status(env: Env, ngo_address: Address) -> u32 {
        let ngos: Map<Address, NGOInfo> = match env.storage().instance().get(&NGOS) {
            Some(n) => n,
            None => return 0,
        };

        match ngos.get(ngo_address) {
            Some(info) => info.status as u32,
            None => 0,
        }
    }

    /// Get NGO info
    pub fn get_ngo_info(env: Env, ngo_address: Address) -> Option<NGOInfo> {
        let ngos: Map<Address, NGOInfo> = env.storage().instance().get(&NGOS)?;
        ngos.get(ngo_address)
    }

    /// Increment campaign count for NGO
    pub fn increment_campaign_count(env: Env, ngo_address: Address) -> Result<(), Error> {
        let mut ngos: Map<Address, NGOInfo> = env.storage()
            .instance()
            .get(&NGOS)
            .ok_or(Error::NGONotRegistered)?;

        let mut ngo_info = ngos.get(ngo_address.clone())
            .ok_or(Error::NGONotRegistered)?;

        ngo_info.total_campaigns += 1;
        ngos.set(ngo_address, ngo_info);
        env.storage().instance().set(&NGOS, &ngos);

        Ok(())
    }

    /// Get all registered NGOs
    pub fn get_all_ngos(env: Env) -> Vec<NGOInfo> {
        let ngos: Map<Address, NGOInfo> = match env.storage().instance().get(&NGOS) {
            Some(n) => n,
            None => return Vec::new(&env),
        };

        let mut result: Vec<NGOInfo> = Vec::new(&env);
        for (_, info) in ngos.iter() {
            result.push_back(info);
        }
        result
    }

    /// Get pending NGOs for admin review
    pub fn get_pending_ngos(env: Env) -> Vec<NGOInfo> {
        let ngos: Map<Address, NGOInfo> = match env.storage().instance().get(&NGOS) {
            Some(n) => n,
            None => return Vec::new(&env),
        };

        let mut result: Vec<NGOInfo> = Vec::new(&env);
        for (_, info) in ngos.iter() {
            if info.status == NGOStatus::Pending {
                result.push_back(info);
            }
        }
        result
    }
}
