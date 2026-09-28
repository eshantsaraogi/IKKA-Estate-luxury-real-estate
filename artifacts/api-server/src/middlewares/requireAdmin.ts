import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const configuredUserId = process.env.ADMIN_CLERK_USER_ID;
  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (configuredUserId && configuredUserId === userId) {
    next();
    return;
  }

  if (configuredEmail) {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses.find(
      (address) => address.id === user.primaryEmailAddressId,
    )?.emailAddress.toLowerCase();
    if (email === configuredEmail) {
      next();
      return;
    }
  }

  res.status(403).json({
    error: "Admin access is not configured for this account. Set ADMIN_EMAIL or ADMIN_CLERK_USER_ID.",
  });
}