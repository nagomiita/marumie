const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create political organizations
  await seedPoliticalOrganizations();

  // Create admin user for local development
  await seedAdminUser();

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Political organizations seeding function
async function seedPoliticalOrganizations() {
  console.log("Creating political organizations...");

  // 政治組織データの定義
  const organizations = [
    {
      displayName: "平野家",
      orgName: null,
      slug: "team-hirano",
      description: "平野家の家計簿",
    },
  ];

  // 政治組織を作成（既存チェック付き）
  for (const orgData of organizations) {
    const existing = await prisma.politicalOrganization.findFirst({
      where: { slug: orgData.slug },
    });

    if (!existing) {
      const created = await prisma.politicalOrganization.create({
        data: orgData,
      });
      console.log("Created political organization:", created);
    } else {
      console.log("Political organization already exists:", existing);
    }
  }
}

// Admin user seeding function
async function seedAdminUser() {
  console.log("Creating admin user...");

  // Default credentials for local development
  const ADMIN_EMAIL = "r.hrn.0930@gmail.com";
  const ADMIN_PASSWORD = "r.hrn.0930@gmail.com";

  // Get Supabase configuration from environment variables
  const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.log(
      "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not found - skipping admin user creation"
    );
    console.log(
      "   To create admin user, ensure SUPABASE_SERVICE_ROLE_KEY is set in .env"
    );
    return;
  }

  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    // Check for existing users
    const existingAdmin = existingUsers.users?.find(
      (user) => user.email === ADMIN_EMAIL
    );

    // Create admin user
    if (existingAdmin) {
      console.log(`✅ Admin user '${ADMIN_EMAIL}' already exists in Supabase`);

      const existingDbAdmin = await prisma.user.findUnique({
        where: { authId: existingAdmin.id },
      });

      if (!existingDbAdmin) {
        await prisma.user.create({
          data: {
            authId: existingAdmin.id,
            email: ADMIN_EMAIL,
            role: "admin",
          },
        });
        console.log("✅ Database admin record created");
      }
    } else {
      const { data: newAdmin, error: adminError } =
        await supabase.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
        });

      if (adminError) {
        throw new Error(`Failed to create admin: ${adminError.message}`);
      }

      await prisma.user.create({
        data: {
          authId: newAdmin.user.id,
          email: ADMIN_EMAIL,
          role: "admin",
        },
      });
      console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
    }

    console.log("✅ User seeding completed!");
    console.log(`   Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log(
      "   You can now log in to the admin panel at http://localhost:3001/login"
    );
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    console.log(
      "   Admin user creation failed, but database seeding will continue"
    );
  }
}
