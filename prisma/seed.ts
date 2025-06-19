import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "admin@gmail.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  await prisma.element.deleteMany();
  await prisma.elementCategory.deleteMany();

  const hashedPassword = await bcrypt.hash("password", 10);

  await prisma.user.create({
    data: {
      fullName: "Praise Mlambo",
      email,
      password: hashedPassword,
    },
  });

  await prisma.elementCategory.createMany({
    data: [
      { id: 1, name: "Temperature" },
      { id: 2, name: "Salinity" },
      { id: 3, name: "Wave" },
      { id: 4, name: "Currents" },
      { id: 5, name: "Chemistry" },
      { id: 6, name: "Meteorological" },
      { id: 7, name: "Biology" },
    ],
  });
  
  await prisma.element.createMany({
    data: [
      { categoryId: 1, name: "Sea Surface Temperature" },
      { categoryId: 1, name: "Subsurface Temperature" },
      { categoryId: 2, name: "Surface Salinity" },
      { categoryId: 2, name: "Deep Ocean Salinity" },
      { categoryId: 3, name: "Wave Height" },
      { categoryId: 3, name: "Wave Period" },
      { categoryId: 4, name: "Surface Current Speed" },
      { categoryId: 4, name: "Current Direction" },
      { categoryId: 5, name: "pH Level" },
      { categoryId: 5, name: "Dissolved Oxygen" },
      { categoryId: 5, name: "Nitrate Concentration" },
      { categoryId: 6, name: "Air Temperature" },
      { categoryId: 6, name: "Wind Speed" },
      { categoryId: 6, name: "Atmospheric Pressure" },
      { categoryId: 7, name: "Chlorophyll Concentration" },
      { categoryId: 7, name: "Algal Bloom Intensity" },
    ],
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
