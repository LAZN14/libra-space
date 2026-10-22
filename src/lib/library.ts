import { prisma } from "./prisma";
import { calcFine } from "./utils";
import { LoanStatus } from "@prisma/client";

export async function getSettings() {
  let settings = await prisma.librarySettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.librarySettings.create({ data: { id: "default" } });
  }
  return settings;
}

export async function syncOverdueLoans() {
  const now = new Date();
  const overdue = await prisma.loan.findMany({
    where: { status: LoanStatus.ACTIVE, dueDate: { lt: now } },
  });

  if (overdue.length === 0) return 0;

  const settings = await getSettings();

  await Promise.all(
    overdue.map((loan) =>
      prisma.loan.update({
        where: { id: loan.id },
        data: {
          status: LoanStatus.OVERDUE,
          fineAmount: calcFine(loan.dueDate, settings.finePerDay),
        },
      })
    )
  );

  return overdue.length;
}

export async function logActivity(
  action: string,
  entity: string,
  opts?: { userId?: string; entityId?: string; details?: string }
) {
  await prisma.activityLog.create({
    data: {
      action,
      entity,
      userId: opts?.userId,
      entityId: opts?.entityId,
      details: opts?.details,
    },
  });
}

export async function getUserActiveLoanCount(userId: string) {
  return prisma.loan.count({
    where: {
      userId,
      status: { in: [LoanStatus.ACTIVE, LoanStatus.OVERDUE] },
    },
  });
}
