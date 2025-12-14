const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create organizations
  await seedOrganizations();

  // Create political organizations
  await seedPoliticalOrganizations();

  // Create sample transactions
  await seedTransactions();

  // Create sample personal transactions
  await seedPersonalTransactions();

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

// Organizations seeding function
async function seedOrganizations() {
  console.log("Creating organizations...");

  // 組織データの定義
  const organizations = [
    {
      name: "team-hirano",
      displayName: "平野家",
      slug: "team-hirano",
      description: "平野家の家計簿",
      type: "household",
    },
  ];

  // 組織を作成（既存チェック付き）
  for (const orgData of organizations) {
    const existing = await prisma.organization.findFirst({
      where: { slug: orgData.slug },
    });

    if (!existing) {
      const created = await prisma.organization.create({
        data: orgData,
      });
      console.log("Created organization:", created);
    } else {
      console.log("Organization already exists:", existing);
    }
  }
}

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

// Transactions seeding function
async function seedTransactions() {
  console.log("Creating sample transactions...");

  // Get the political organization
  const politicalOrg = await prisma.politicalOrganization.findFirst({
    where: { slug: "team-hirano" },
  });

  if (!politicalOrg) {
    console.log("Political organization not found, skipping transactions");
    return;
  }

  // Sample transactions data
  const transactions = [
    {
      transactionNo: "T001",
      transactionDate: new Date("2025-04-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T002",
      transactionDate: new Date("2025-04-15"),
      financialYear: 2025,
      transactionType: "expense",
      debitAccount: "食費",
      debitAmount: 5000,
      creditAccount: "現金",
      creditAmount: 5000,
      description: "スーパーでの買い物",
      categoryKey: "food",
      label: "食費",
    },
    {
      transactionNo: "T003",
      transactionDate: new Date("2025-05-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T004",
      transactionDate: new Date("2025-06-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T005",
      transactionDate: new Date("2025-07-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T006",
      transactionDate: new Date("2025-08-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T007",
      transactionDate: new Date("2025-09-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T008",
      transactionDate: new Date("2025-10-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T009",
      transactionDate: new Date("2025-11-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T010",
      transactionDate: new Date("2025-12-01"),
      financialYear: 2025,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T011",
      transactionDate: new Date("2026-01-01"),
      financialYear: 2026,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T012",
      transactionDate: new Date("2026-02-01"),
      financialYear: 2026,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
    {
      transactionNo: "T013",
      transactionDate: new Date("2026-03-01"),
      financialYear: 2026,
      transactionType: "income",
      debitAccount: "現金",
      debitAmount: 100000,
      creditAccount: "収入",
      creditAmount: 100000,
      description: "給与収入",
      categoryKey: "salary",
      label: "給与",
    },
  ];

  for (const txData of transactions) {
    const existing = await prisma.transaction.findFirst({
      where: {
        politicalOrganizationId: politicalOrg.id,
        transactionNo: txData.transactionNo,
      },
    });

    if (!existing) {
      const created = await prisma.transaction.create({
        data: {
          ...txData,
          politicalOrganizationId: politicalOrg.id,
        },
      });
      console.log("Created transaction:", created.transactionNo);
    } else {
      console.log("Transaction already exists:", existing.transactionNo);
    }
  }
}

// Personal transactions seeding function
async function seedPersonalTransactions() {
  console.log("Creating sample personal transactions...");

  // Get the organization
  const org = await prisma.organization.findFirst({
    where: { slug: "team-hirano" },
  });

  if (!org) {
    console.log("Organization not found, skipping personal transactions");
    return;
  }

  // Sample personal transactions data
  const personalTransactions = [
    {
      date: new Date("2025-04-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "4月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-04-10"),
      category: "食費",
      subcategory: "外食",
      amount: 3000,
      type: "expense",
      paymentMethod: "クレジットカード",
      description: "ランチ",
      memo: "同僚との食事",
    },
    {
      date: new Date("2025-04-15"),
      category: "交通費",
      subcategory: "電車",
      amount: 1500,
      type: "expense",
      paymentMethod: "Suica",
      description: "通勤費",
      memo: "定期代",
    },
    {
      date: new Date("2025-05-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "5月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-05-20"),
      category: "日用品",
      subcategory: "雑貨",
      amount: 2500,
      type: "expense",
      paymentMethod: "現金",
      description: "文房具購入",
      memo: "ノートとペン",
    },
    {
      date: new Date("2025-06-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "6月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-06-25"),
      category: "娯楽費",
      subcategory: "映画",
      amount: 2000,
      type: "expense",
      paymentMethod: "クレジットカード",
      description: "映画鑑賞",
      memo: "新作映画",
    },
    {
      date: new Date("2025-07-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "7月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-07-15"),
      category: "食費",
      subcategory: "スーパー",
      amount: 4500,
      type: "expense",
      paymentMethod: "現金",
      description: "週末の買い物",
      memo: "野菜と肉",
    },
    {
      date: new Date("2025-08-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "8月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-08-10"),
      category: "交通費",
      subcategory: "バス",
      amount: 800,
      type: "expense",
      paymentMethod: "ICカード",
      description: "バス代",
      memo: "市内移動",
    },
    {
      date: new Date("2025-09-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "9月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-09-20"),
      category: "医療費",
      subcategory: "薬",
      amount: 1200,
      type: "expense",
      paymentMethod: "現金",
      description: "風邪薬",
      memo: "ドラッグストア",
    },
    {
      date: new Date("2025-10-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "10月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-10-30"),
      category: "衣服費",
      subcategory: "靴",
      amount: 8500,
      type: "expense",
      paymentMethod: "クレジットカード",
      description: "スニーカー購入",
      memo: "スポーツ用",
    },
    {
      date: new Date("2025-11-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "11月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-11-15"),
      category: "光熱費",
      subcategory: "電気代",
      amount: 6500,
      type: "expense",
      paymentMethod: "口座振替",
      description: "電気料金",
      memo: "10月分",
    },
    {
      date: new Date("2025-12-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "12月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2025-12-25"),
      category: "食費",
      subcategory: "クリスマス",
      amount: 5200,
      type: "expense",
      paymentMethod: "クレジットカード",
      description: "クリスマスケーキ",
      memo: "家族用",
    },
    {
      date: new Date("2026-01-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "1月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2026-01-10"),
      category: "通信費",
      subcategory: "携帯電話",
      amount: 4800,
      type: "expense",
      paymentMethod: "クレジットカード",
      description: "携帯料金",
      memo: "12月分",
    },
    {
      date: new Date("2026-02-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "2月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2026-02-14"),
      category: "娯楽費",
      subcategory: "バレンタイン",
      amount: 3200,
      type: "expense",
      paymentMethod: "現金",
      description: "チョコレート",
      memo: "家族用",
    },
    {
      date: new Date("2026-03-01"),
      category: "給与",
      subcategory: "基本給",
      amount: 100000,
      type: "income",
      paymentMethod: "銀行振込",
      description: "3月の給与",
      memo: "基本給 + 諸手当",
    },
    {
      date: new Date("2026-03-20"),
      category: "日用品",
      subcategory: "洗剤",
      amount: 1800,
      type: "expense",
      paymentMethod: "現金",
      description: "洗濯洗剤",
      memo: "詰め替え用",
    },
  ];

  for (const txData of personalTransactions) {
    const hash = `${txData.date.toISOString()}-${txData.category}-${txData.amount}`;
    const existing = await prisma.personalTransaction.findFirst({
      where: { hash },
    });

    if (!existing) {
      const created = await prisma.personalTransaction.create({
        data: {
          ...txData,
          organizationId: org.id,
          hash,
        },
      });
      console.log("Created personal transaction:", created.description);
    } else {
      console.log("Personal transaction already exists:", existing.description);
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
