const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const categories = [
  { name: "Mama Fua", icon: "👗" },
  { name: "Shamba Boy", icon: "🌱" },
  { name: "Plumber", icon: "🔧" },
  { name: "Welder", icon: "🔥" },
  { name: "Carpenter", icon: "🪵" },
  { name: "Home Repairs", icon: "🏠" },
  { name: "Movers", icon: "🚛" },
  { name: "Cleaning", icon: "🧹" },
  { name: "Electrician", icon: "⚡" },
  { name: "Painter", icon: "🖌️" },
  { name: "Driver", icon: "🚗" },
  { name: "Security", icon: "🛡️" },
];

async function main() {
  console.log("Seeding categories...");

  // Clear old categories and replace with new ones
  await prisma.category.deleteMany({});

  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }

  console.log(`✅ ${categories.length} categories seeded.`);

  // Create a demo admin user
  const adminExists = await prisma.user.findUnique({ where: { email: "admin@taskbridge.co.ke" } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "TaskBridge Admin",
        email: "admin@taskbridge.co.ke",
        password: await bcrypt.hash("Admin@123456", 12),
        role: "ADMIN",
        phone: "254700000000",
        verified: true,
      },
    });
    console.log("✅ Demo admin created: admin@taskbridge.co.ke / Admin@123456");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
