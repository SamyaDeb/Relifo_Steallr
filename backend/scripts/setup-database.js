const { connectToDatabase } = require('../config/mongodb');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MongoDB database and collections...\n');

    const { db } = await connectToDatabase();

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    // 1. Beneficiary Applications Collection
    if (!collectionNames.includes('beneficiary_applications')) {
      await db.createCollection('beneficiary_applications');
      console.log('✅ Created collection: beneficiary_applications');
    } else {
      console.log('ℹ️  Collection already exists: beneficiary_applications');
    }

    // 2. Beneficiary Approvals Collection
    if (!collectionNames.includes('beneficiary_approvals')) {
      await db.createCollection('beneficiary_approvals');
      console.log('✅ Created collection: beneficiary_approvals');
    } else {
      console.log('ℹ️  Collection already exists: beneficiary_approvals');
    }

    // 3. NGO Admins Collection
    if (!collectionNames.includes('ngo_admins')) {
      await db.createCollection('ngo_admins');
      console.log('✅ Created collection: ngo_admins');
    } else {
      console.log('ℹ️  Collection already exists: ngo_admins');
    }

    // 4. Merchants Collection
    if (!collectionNames.includes('merchants')) {
      await db.createCollection('merchants');
      console.log('✅ Created collection: merchants');
    } else {
      console.log('ℹ️  Collection already exists: merchants');
    }

    console.log('\n📊 Creating indexes for optimal performance...\n');

    // Create indexes for beneficiary_applications
    await db.collection('beneficiary_applications').createIndex(
      { campaign_id: 1, status: 1 },
      { name: 'campaign_status_idx' }
    );
    await db.collection('beneficiary_applications').createIndex(
      { beneficiary_address: 1 },
      { name: 'beneficiary_address_idx' }
    );
    console.log('✅ Indexes created for beneficiary_applications');

    // Create unique index for beneficiary_approvals
    await db.collection('beneficiary_approvals').createIndex(
      { beneficiary_address: 1 },
      { unique: true, name: 'beneficiary_address_unique_idx' }
    );
    console.log('✅ Indexes created for beneficiary_approvals');

    // Create unique index for ngo_admins
    await db.collection('ngo_admins').createIndex(
      { ngo_address: 1 },
      { unique: true, name: 'ngo_address_unique_idx' }
    );
    await db.collection('ngo_admins').createIndex(
      { verified: 1 },
      { name: 'verified_idx' }
    );
    console.log('✅ Indexes created for ngo_admins');

    // Create indexes for merchants
    await db.collection('merchants').createIndex(
      { merchant_address: 1 },
      { unique: true, name: 'merchant_address_unique_idx' }
    );
    await db.collection('merchants').createIndex(
      { categories: 1 },
      { name: 'categories_idx' }
    );
    await db.collection('merchants').createIndex(
      { status: 1 },
      { name: 'status_idx' }
    );
    console.log('✅ Indexes created for merchants');

    console.log('\n✨ Database setup completed successfully!\n');
    console.log('📁 Database: relifo_testnet');
    console.log('📦 Collections:');
    console.log('   - beneficiary_applications');
    console.log('   - beneficiary_approvals');
    console.log('   - ngo_admins');
    console.log('   - merchants');
    console.log('🗂️  GridFS bucket: documents (for PDF storage)');
    console.log('\n✅ Phase 0 setup complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
