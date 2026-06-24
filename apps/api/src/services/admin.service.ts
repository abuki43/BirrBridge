import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { env } from '../env.js';
import type { AdminJwtPayload, AuditLogInput } from '../types/index.js';

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;

  const token = jwt.sign(
    { adminId: admin.id, role: admin.role } satisfies AdminJwtPayload,
    env.ADMIN_JWT_SECRET,
    { expiresIn: '8h' },
  );

  await createAuditLog({
    action: 'ADMIN_LOGIN',
    performedBy: admin.id,
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}

export function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    return jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export async function createAuditLog(input: AuditLogInput) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      performedBy: input.performedBy,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      previousValue: input.previousValue ?? undefined,
      newValue: input.newValue ?? undefined,
    },
  });
}
