import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Platform Admin User
  console.log('Creating platform admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ubiquitous-ai.com' },
    update: {},
    create: {
      clerk_user_id: 'clerk_admin_placeholder',
      email: 'admin@ubiquitous-ai.com',
      role: UserRole.PLATFORM_ADMIN,
    },
  });
  console.log('✓ Platform admin created:', adminUser.email);

  // Create Test Agency (Tenant)
  console.log('\nCreating test agency tenant...');
  const testAgency = await prisma.tenant.upsert({
    where: { slug: 'demo-agency' },
    update: {},
    create: {
      name: 'Demo Agency',
      slug: 'demo-agency',
      settings: {
        timezone: 'UTC',
        default_post_count: 10,
        default_reel_count: 5,
      },
    },
  });
  console.log('✓ Test agency created:', testAgency.name);

  // Create Agency Staff User
  console.log('\nCreating agency staff user...');
  const agencyUser = await prisma.user.upsert({
    where: { email: 'staff@demo-agency.com' },
    update: {},
    create: {
      clerk_user_id: 'clerk_agency_placeholder',
      email: 'staff@demo-agency.com',
      role: UserRole.AGENCY_STAFF,
      tenant_id: testAgency.id,
    },
  });
  console.log('✓ Agency staff user created:', agencyUser.email);

  // Create Test Client (Brand)
  console.log('\nCreating test client...');
  const testClient = await prisma.client.upsert({
    where: { id: 'test-client-1' },
    update: {},
    create: {
      id: 'test-client-1',
      name: 'Acme Corporation',
      tenant_id: testAgency.id,
      contact_info: {
        email: 'contact@acme.com',
        phone: '+1-555-0100',
        primary_contact: 'John Doe',
      },
    },
  });
  console.log('✓ Test client created:', testClient.name);

  // Create Organization Profile for Client
  console.log('\nCreating organization profile...');
  const orgProfile = await prisma.organizationProfile.upsert({
    where: { client_id: testClient.id },
    update: {},
    create: {
      client_id: testClient.id,
      tenant_id: testAgency.id,
      brand_tone: 'Professional yet approachable',
      industry: 'Technology',
      target_audience: 'B2B tech decision makers aged 30-50',
      voice_attributes: {
        personality: ['innovative', 'trustworthy', 'forward-thinking'],
        avoid: ['overly casual', 'technical jargon'],
        preferred_style: 'conversational but authoritative',
      },
    },
  });
  console.log('✓ Organization profile created');

  // Create Client User
  console.log('\nCreating client user...');
  const clientUser = await prisma.user.upsert({
    where: { email: 'john@acme.com' },
    update: {},
    create: {
      clerk_user_id: 'clerk_client_placeholder',
      email: 'john@acme.com',
      role: UserRole.CLIENT,
      tenant_id: testAgency.id,
    },
  });
  console.log('✓ Client user created:', clientUser.email);

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  - Platform Admin: ${adminUser.email}`);
  console.log(`  - Agency: ${testAgency.name} (${testAgency.slug})`);
  console.log(`  - Agency Staff: ${agencyUser.email}`);
  console.log(`  - Client: ${testClient.name}`);
  console.log(`  - Client User: ${clientUser.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
