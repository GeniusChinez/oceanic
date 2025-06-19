import type { User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return await prisma.user.findFirst({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return await prisma.user.findFirst({ where: { email } });
}

export async function createUser(email: User["email"], password: string, fullName: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return await prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: string,
) {
  const userWithPassword = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
