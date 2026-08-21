import { eq } from "drizzle-orm";
import type { Database } from "../client";
import { users, type User, type UserRole } from "../schema";

export function findUserByEmail(db: Database, email: string): Promise<User | undefined> {
  return db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .then((rows) => rows[0]);
}

export function findUserById(db: Database, id: string): Promise<User | undefined> {
  return db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .then((rows) => rows[0]);
}

export interface CreateUserParams {
  email: string;
  passwordHash: string;
  role: UserRole;
}

export async function createUser(db: Database, params: CreateUserParams): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({ ...params, email: params.email.toLowerCase() })
    .returning();
  if (!user) {
    throw new Error("insert into users returned no row");
  }
  return user;
}

export async function touchLastLogin(db: Database, userId: string): Promise<void> {
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userId));
}
