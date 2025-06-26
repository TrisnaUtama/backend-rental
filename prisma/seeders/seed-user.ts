import type { PrismaClient, Users } from "@prisma/client";

export async function seedUsers(prisma: PrismaClient): Promise<Users[]> {
  console.log("🌱 Seeding users...");

  const admin_hashed_password = await Bun.password.hash("passwordadmin@ex.com", "bcrypt");
  await prisma.users.upsert({
    where: { email: "admin@ex.com" },
    update: {},
    create: {
      email: "admin@ex.com",
      name: "admin",
      password: admin_hashed_password,
      phone_number: "99237404852",
      is_verified: true,
      status: true,
      role: "SUPERADMIN",
      year_of_experiences: 0,
    },
  });

  const customers: Users[] = [];
  for (let i = 1; i <= 10; i++) {
    const email = `customer${i}@ex.com`;
    const password = `password${i}${email}`;
    const hashed_password = await Bun.password.hash(password, "bcrypt");
    
    const customer = await prisma.users.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Customer ${i}`,
        password: hashed_password,
        phone_number: `123456789${i.toString().padStart(2, "0")}`,
        is_verified: true,
        status: true,
        role: "CUSTOMER",
        year_of_experiences: 0,
      },
    });
    customers.push(customer);
  }
  
  console.log(`✅ ${customers.length + 1} users seeded.`);
  return customers;
}