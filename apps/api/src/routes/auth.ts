import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { getDb } from "../db/client";
import { createUser, findUserByEmail, touchLastLogin } from "../db/queries/users";
import type { UserRole } from "../db/schema";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters"),
});

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

authRouter.post("/auth/signup", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const db = await getDb();
    const existing = await findUserByEmail(db, email);
    if (existing) {
      res.status(409).json({ error: "an account with this email already exists" });
      return;
    }

    const passwordHash = await argon2.hash(password);
    const role: UserRole = adminEmails().has(email.toLowerCase()) ? "admin" : "operator";
    const user = await createUser(db, { email, passwordHash, role });

    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("[POST /api/v1/auth/signup]", error);
    res.status(500).json({ error: "failed to create account" });
  }
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid email or password" });
    return;
  }
  const { email, password } = parsed.data;

  try {
    const db = await getDb();
    const user = await findUserByEmail(db, email);
    if (!user) {
      res.status(401).json({ error: "invalid email or password" });
      return;
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);
    if (!passwordMatches) {
      res.status(401).json({ error: "invalid email or password" });
      return;
    }

    await touchLastLogin(db, user.id);
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("[POST /api/v1/auth/login]", error);
    res.status(500).json({ error: "failed to log in" });
  }
});
