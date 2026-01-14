use soroban_sdk::{contracttype, symbol_short, Address, Env, String, Symbol};

/// Events emitted by Relifo contracts for audit trail

// Event topic symbols (max 9 characters for symbol_short!)
pub const NGO_REGISTERED: Symbol = symbol_short!("ngo_reg");
pub const NGO_VERIFIED: Symbol = symbol_short!("ngo_ver");
pub const CAMPAIGN_CREATED: Symbol = symbol_short!("camp_crt");
pub const DONATION_RECEIVED: Symbol = symbol_short!("donation");
pub const BENEFICIARY_WHITELISTED: Symbol = symbol_short!("ben_wl");
pub const BENEFICIARY_REVOKED: Symbol = symbol_short!("ben_rev");
pub const FUNDS_ALLOCATED: Symbol = symbol_short!("fnd_alloc");
pub const DIRECT_TRANSFER: Symbol = symbol_short!("direct");
pub const SPENDING_AUTHORIZED: Symbol = symbol_short!("spnd_auth");
pub const TRANSACTION_EXECUTED: Symbol = symbol_short!("tx_exec");
pub const MERCHANT_REGISTERED: Symbol = symbol_short!("merch_reg");
pub const AUDIT_TRAIL: Symbol = symbol_short!("audit");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NGORegisteredEvent {
    pub ngo_address: Address,
    pub name: String,
    pub country: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NGOVerifiedEvent {
    pub ngo_address: Address,
    pub verified_by: Address,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CampaignCreatedEvent {
    pub campaign_id: String,
    pub ngo_address: Address,
    pub target_amount: i128,
    pub control_mode: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DonationReceivedEvent {
    pub campaign_id: String,
    pub donor_address: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BeneficiaryWhitelistedEvent {
    pub campaign_id: String,
    pub beneficiary_address: Address,
    pub control_mode: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BeneficiaryRevokedEvent {
    pub campaign_id: String,
    pub beneficiary_address: Address,
    pub reason: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct FundsAllocatedEvent {
    pub campaign_id: String,
    pub beneficiary_address: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DirectTransferEvent {
    pub campaign_id: String,
    pub beneficiary_address: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SpendingAuthorizedEvent {
    pub beneficiary_address: Address,
    pub merchant_address: Address,
    pub category: Symbol,
    pub amount: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TransactionExecutedEvent {
    pub beneficiary_address: Address,
    pub merchant_address: Address,
    pub category: Symbol,
    pub amount: i128,
    pub remaining_balance: i128,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MerchantRegisteredEvent {
    pub merchant_address: Address,
    pub name: String,
    pub categories: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuditTrailEvent {
    pub event_type: Symbol,
    pub campaign_id: String,
    pub actor: Address,
    pub details: String,
    pub timestamp: u64,
}

/// Helper functions to emit events
pub fn emit_ngo_registered(env: &Env, ngo_address: Address, name: String, country: String) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (NGO_REGISTERED, ngo_address.clone()),
        NGORegisteredEvent {
            ngo_address,
            name,
            country,
            timestamp,
        },
    );
}

pub fn emit_ngo_verified(env: &Env, ngo_address: Address, verified_by: Address) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (NGO_VERIFIED, ngo_address.clone()),
        NGOVerifiedEvent {
            ngo_address,
            verified_by,
            timestamp,
        },
    );
}

pub fn emit_campaign_created(
    env: &Env,
    campaign_id: String,
    ngo_address: Address,
    target_amount: i128,
    control_mode: String,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (CAMPAIGN_CREATED, campaign_id.clone()),
        CampaignCreatedEvent {
            campaign_id,
            ngo_address,
            target_amount,
            control_mode,
            timestamp,
        },
    );
}

pub fn emit_donation_received(
    env: &Env,
    campaign_id: String,
    donor_address: Address,
    amount: i128,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (DONATION_RECEIVED, campaign_id.clone()),
        DonationReceivedEvent {
            campaign_id,
            donor_address,
            amount,
            timestamp,
        },
    );
}

pub fn emit_beneficiary_whitelisted(
    env: &Env,
    campaign_id: String,
    beneficiary_address: Address,
    control_mode: String,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (BENEFICIARY_WHITELISTED, beneficiary_address.clone()),
        BeneficiaryWhitelistedEvent {
            campaign_id,
            beneficiary_address,
            control_mode,
            timestamp,
        },
    );
}

pub fn emit_beneficiary_revoked(
    env: &Env,
    campaign_id: String,
    beneficiary_address: Address,
    reason: String,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (BENEFICIARY_REVOKED, beneficiary_address.clone()),
        BeneficiaryRevokedEvent {
            campaign_id,
            beneficiary_address,
            reason,
            timestamp,
        },
    );
}

pub fn emit_funds_allocated(
    env: &Env,
    campaign_id: String,
    beneficiary_address: Address,
    amount: i128,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (FUNDS_ALLOCATED, beneficiary_address.clone()),
        FundsAllocatedEvent {
            campaign_id,
            beneficiary_address,
            amount,
            timestamp,
        },
    );
}

pub fn emit_direct_transfer(
    env: &Env,
    campaign_id: String,
    beneficiary_address: Address,
    amount: i128,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (DIRECT_TRANSFER, beneficiary_address.clone()),
        DirectTransferEvent {
            campaign_id,
            beneficiary_address,
            amount,
            timestamp,
        },
    );
}

pub fn emit_spending_authorized(
    env: &Env,
    beneficiary_address: Address,
    merchant_address: Address,
    category: Symbol,
    amount: i128,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (SPENDING_AUTHORIZED, beneficiary_address.clone()),
        SpendingAuthorizedEvent {
            beneficiary_address,
            merchant_address,
            category,
            amount,
            timestamp,
        },
    );
}

pub fn emit_transaction_executed(
    env: &Env,
    beneficiary_address: Address,
    merchant_address: Address,
    category: Symbol,
    amount: i128,
    remaining_balance: i128,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (TRANSACTION_EXECUTED, beneficiary_address.clone()),
        TransactionExecutedEvent {
            beneficiary_address,
            merchant_address,
            category,
            amount,
            remaining_balance,
            timestamp,
        },
    );
}

pub fn emit_merchant_registered(
    env: &Env,
    merchant_address: Address,
    name: String,
    categories: String,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (MERCHANT_REGISTERED, merchant_address.clone()),
        MerchantRegisteredEvent {
            merchant_address,
            name,
            categories,
            timestamp,
        },
    );
}

pub fn emit_audit_trail(
    env: &Env,
    event_type: Symbol,
    campaign_id: String,
    actor: Address,
    details: String,
) {
    let timestamp = env.ledger().timestamp();
    env.events().publish(
        (AUDIT_TRAIL, event_type.clone()),
        AuditTrailEvent {
            event_type,
            campaign_id,
            actor,
            details,
            timestamp,
        },
    );
}

