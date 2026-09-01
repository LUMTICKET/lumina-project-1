import { createHash, randomBytes } from "node:crypto";
import { Prisma, UserRole } from "@prisma/client";
import type { LoginInput, RegisterInput } from "@/contracts/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/modules/auth/password";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const authUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  organizer: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.UserSelect;

export type AuthUserRecord = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

function userDto(user: AuthUserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.toLowerCase(),
    organizer: user.organizer,
  };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.authSession.create({
    data: { userId, tokenHash: tokenHash(token), expiresAt },
  });

  return { token, expiresAt: expiresAt.toISOString() };
}

export async function register(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password);
  const role =
    input.accountType === "organizer" ? UserRole.ORGANIZER : UserRole.CUSTOMER;

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role,
        ...(role === UserRole.ORGANIZER
          ? { organizer: { create: { name: input.name } } }
          : {}),
      },
      select: authUserSelect,
    });
    const session = await createSession(user.id);
    return { kind: "created" as const, user: userDto(user), ...session };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { kind: "email_in_use" as const };
    }
    throw error;
  }
}

export async function login(input: LoginInput) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...authUserSelect, passwordHash: true },
  });

  if (
    !userWithPassword ||
    !(await verifyPassword(input.password, userWithPassword.passwordHash))
  ) {
    return null;
  }

  const user: AuthUserRecord = {
    id: userWithPassword.id,
    email: userWithPassword.email,
    name: userWithPassword.name,
    role: userWithPassword.role,
    organizer: userWithPassword.organizer,
  };
  const session = await createSession(user.id);
  return { user: userDto(user), ...session };
}

export function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function authenticate(request: Request) {
  const token = bearerToken(request);
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: { select: authUserSelect } },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.authSession.delete({ where: { id: session.id } });
    return null;
  }

  if (Date.now() - session.lastUsedAt.getTime() > 15 * 60 * 1000) {
    await prisma.authSession.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return { sessionId: session.id, user: userDto(session.user) };
}

export async function logout(request: Request) {
  const token = bearerToken(request);
  if (!token) return;
  await prisma.authSession.deleteMany({ where: { tokenHash: tokenHash(token) } });
}
