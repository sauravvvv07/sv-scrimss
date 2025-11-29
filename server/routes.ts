import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./db";
import { 
  users, 
  scrims, 
  scrimRegistrations, 
  transactions, 
  teammatesPosts, 
  chatMessages, 
  leaderboardEntries,
  teamProfiles,
  insertUserSchema,
  loginSchema,
  type User,
} from "@shared/schema";
import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendPaymentConfirmation, sendPaymentApproved, sendWalletNotification } from "./email";
import { createPaymentOrder, verifyPaymentSignature } from "./razorpay";

const JWT_SECRET = process.env.JWT_SECRET || "svscrims_secret_key_2024";
const ADMIN_EMAIL = "sauravans21@gmail.com";
const ADMIN_PASSWORD = "sauravisgreat";

const upload = multer({ dest: "uploads/" });

interface AuthRequest extends express.Request {
  user?: User;
}

const authMiddleware = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.banned) {
      return res.status(403).json({ message: "Account banned" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminMiddleware = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const BAD_WORDS = ["fuck", "shit", "asshole", "bitch", "damn", "bastard", "idiot"];

function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body) as any;
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const playerId = nanoid(8).toUpperCase();

      const [user] = await db.insert(users).values({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        playerId,
      }).returning();

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);

      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
        let [admin] = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL));

        if (!admin) {
          const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
          [admin] = await db.insert(users).values({
            username: "Admin",
            email: ADMIN_EMAIL,
            password: hashedPassword,
            playerId: "ADMIN001",
            role: "admin",
          }).returning();
        }

        const token = jwt.sign({ userId: admin.id }, JWT_SECRET);
        const { password, ...adminWithoutPassword } = admin;
        return res.json({ user: adminWithoutPassword, token });
      }

      const [user] = await db.select().from(users).where(eq(users.email, data.email));

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.banned) {
        return res.status(403).json({ message: "Account banned" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/scrims", async (req, res) => {
    try {
      const allScrims = await db.select().from(scrims).orderBy(desc(scrims.createdAt));
      res.json(allScrims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scrims" });
    }
  });

  app.post("/api/payment/create-order", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { amount, scrimId } = req.body;
      
      const [scrim] = await db.select().from(scrims).where(eq(scrims.id, parseInt(scrimId)));
      if (!scrim) {
        return res.status(400).json({ message: "Scrim not found" });
      }

      const order = await createPaymentOrder({
        amount: parseFloat(amount),
        receipt: `scrim_${scrimId}_${req.user!.id}`,
        description: `${scrim.matchType} Scrim - ₹${amount}`,
      }) as any;

      res.json({ orderId: order?.id, amount: order?.amount || parseFloat(amount), currency: order?.currency || "INR" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create payment order" });
    }
  });

  app.post("/api/payment/verify", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, scrimId, amount } = req.body;

      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ message: "Payment verification not configured" });
      }

      const isValid = await verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        process.env.RAZORPAY_KEY_SECRET
      );

      if (!isValid) {
        return res.status(400).json({ message: "Payment verification failed" });
      }

      const [scrim] = await db.select().from(scrims).where(eq(scrims.id, parseInt(scrimId)));
      if (!scrim || scrim.spotsRemaining <= 0) {
        return res.status(400).json({ message: "Scrim full or not found" });
      }

      const existing = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, parseInt(scrimId)),
          eq(scrimRegistrations.userId, req.user!.id)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ message: "Already registered" });
      }

      const [transaction] = await db.insert(transactions).values({
        userId: req.user!.id,
        type: "entryFee",
        amount,
        utr: razorpayPaymentId,
        scrimId: parseInt(scrimId),
        paymentStatus: "verified",
      }).returning();

      await db.insert(scrimRegistrations).values({
        scrimId: parseInt(scrimId),
        userId: req.user!.id,
        paymentStatus: "verified",
      });

      await db.update(scrims)
        .set({ spotsRemaining: sql`${scrims.spotsRemaining} - 1` })
        .where(eq(scrims.id, parseInt(scrimId)));

      await sendPaymentConfirmation(
        req.user!.email,
        req.user!.username,
        amount,
        scrim.matchType
      );

      res.json({ message: "Payment verified and registration successful", transaction });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Payment verification failed" });
    }
  });

  app.post("/api/scrim/register", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { scrimId, mode, teamName, teamMembers } = req.body;
      const [scrim] = await db.select().from(scrims).where(eq(scrims.id, parseInt(scrimId)));

      if (!scrim || scrim.spotsRemaining <= 0) {
        return res.status(400).json({ message: "Scrim full or not found" });
      }

      const existing = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, parseInt(scrimId)),
          eq(scrimRegistrations.userId, req.user!.id)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ message: "Already registered for this scrim" });
      }

      const entryFeeAmount = parseFloat(scrim.entryFee.toString());
      const userBalance = parseFloat(req.user!.walletBalance.toString());

      // Check if user has enough wallet balance
      if (userBalance < entryFeeAmount) {
        return res.status(400).json({ 
          message: "Insufficient wallet balance",
          required: entryFeeAmount,
          available: userBalance,
          shortfall: entryFeeAmount - userBalance
        });
      }

      // Deduct from wallet instantly
      await db.update(users)
        .set({ walletBalance: sql`${users.walletBalance} - ${entryFeeAmount}` })
        .where(eq(users.id, req.user!.id));

      // Create transaction record
      const [transaction] = await db.insert(transactions).values({
        userId: req.user!.id,
        type: "entryFee",
        amount: entryFeeAmount.toString(),
        teamName: teamName || null,
        scrimId: parseInt(scrimId),
        paymentStatus: "verified",
      }).returning();

      // Assign slot number - Sequential, not random
      let slotNumber: number;
      
      if (mode === "squad") {
        // Squad uses slots 1-98
        const existingSlots = await db.select().from(scrimRegistrations)
          .where(and(
            eq(scrimRegistrations.scrimId, parseInt(scrimId)),
            eq(scrimRegistrations.mode, "squad")
          ));
        
        const takenSlots = existingSlots.map(r => r.slotNumber).filter(s => s !== null);
        let slot = 1;
        while (takenSlots.includes(slot) && slot <= 98) {
          slot += 4; // Squad slots: 1, 5, 9, 13, ... 97
        }
        slotNumber = slot <= 98 ? slot : 97;
      } else {
        // Solo/Duo use slots 99-100
        const existingSoloDuoSlots = await db.select().from(scrimRegistrations)
          .where(and(
            eq(scrimRegistrations.scrimId, parseInt(scrimId)),
            sql`${scrimRegistrations.mode} IN ('solo', 'duo')`
          ));
        
        const takenSlots = existingSoloDuoSlots.map(r => r.slotNumber).filter(s => s !== null);
        slotNumber = takenSlots.includes(99) ? 100 : 99;
      }

      const [registration] = await db.insert(scrimRegistrations).values({
        scrimId: parseInt(scrimId),
        userId: req.user!.id,
        mode,
        teamName: teamName || null,
        slotNumber,
        paymentStatus: "verified",
      }).returning();

      // Determine team size
      const teamSizes = { solo: 1, duo: 2, squad: 4 };
      const teamSize = teamSizes[mode as keyof typeof teamSizes] || 1;

      // Update scrim spots
      await db.update(scrims)
        .set({ 
          spotsRemaining: sql`${scrims.spotsRemaining} - ${teamSize}`,
          status: sql`CASE WHEN ${scrims.spotsRemaining} - ${teamSize} <= 0 THEN 'full' ELSE ${scrims.status} END`
        })
        .where(eq(scrims.id, parseInt(scrimId)));

      // Save team profile for next time
      if (teamMembers && teamMembers.length > 0) {
        const [existingTeam] = await db.select().from(teamProfiles)
          .where(eq(teamProfiles.userId, req.user!.id));

        if (existingTeam) {
          await db.update(teamProfiles)
            .set({
              teamName: teamName || existingTeam.teamName,
              mode,
              members: teamMembers,
              updatedAt: new Date(),
            })
            .where(eq(teamProfiles.userId, req.user!.id));
        } else {
          await db.insert(teamProfiles).values({
            userId: req.user!.id,
            teamName: teamName || null,
            mode,
            members: teamMembers,
          });
        }
      }

      res.json({ 
        message: "Registration successful! Entry fee deducted from wallet",
        registration,
        transaction,
        slotNumber,
        userName: req.user!.username,
        newBalance: parseFloat(req.user!.walletBalance.toString()) - entryFeeAmount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/payment/register", authMiddleware, upload.single("screenshot"), async (req: AuthRequest, res) => {
    try {
      const { scrimId, amount, utr, teamName } = req.body;
      const screenshot = req.file;

      const [scrim] = await db.select().from(scrims).where(eq(scrims.id, parseInt(scrimId)));

      if (!scrim || scrim.spotsRemaining <= 0) {
        return res.status(400).json({ message: "Scrim full or not found" });
      }

      const existing = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, parseInt(scrimId)),
          eq(scrimRegistrations.userId, req.user!.id)
        ));

      if (existing.length > 0) {
        return res.status(400).json({ message: "Already registered" });
      }

      const isFreeScrim = !amount || parseFloat(amount) === 0;

      if (isFreeScrim) {
        await db.insert(scrimRegistrations).values({
          scrimId: parseInt(scrimId),
          userId: req.user!.id,
          paymentStatus: "verified",
        });

        await db.update(scrims)
          .set({ spotsRemaining: sql`${scrims.spotsRemaining} - 1` })
          .where(eq(scrims.id, parseInt(scrimId)));

        await sendPaymentConfirmation(
          req.user!.email,
          req.user!.username,
          "0",
          scrim.matchType
        );

        return res.json({ message: "Registration successful" });
      }

      const [transaction] = await db.insert(transactions).values({
        userId: req.user!.id,
        type: "entryFee",
        amount,
        utr: utr || null,
        teamName: teamName || null,
        screenshotUrl: screenshot ? `/uploads/${screenshot.filename}` : null,
        scrimId: parseInt(scrimId),
        paymentStatus: "pending",
      }).returning();

      await db.insert(scrimRegistrations).values({
        scrimId: parseInt(scrimId),
        userId: req.user!.id,
        paymentStatus: "pending",
      });

      await sendPaymentConfirmation(
        req.user!.email,
        req.user!.username,
        amount,
        scrim.matchType
      );

      res.json({ message: "Registration submitted", transaction });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  app.get("/api/scrim/team-profile", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const [profile] = await db.select().from(teamProfiles)
        .where(eq(teamProfiles.userId, req.user!.id));
      
      res.json(profile || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch team profile" });
    }
  });

  app.get("/api/scrim/:scrimId/slots-status", async (req, res) => {
    try {
      const scrimId = parseInt(req.params.scrimId);
      
      // Count registrations by mode for this scrim
      const soloRegistrations = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, scrimId),
          eq(scrimRegistrations.mode, "solo")
        ));
      
      const duoRegistrations = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, scrimId),
          eq(scrimRegistrations.mode, "duo")
        ));
      
      const squadRegistrations = await db.select().from(scrimRegistrations)
        .where(and(
          eq(scrimRegistrations.scrimId, scrimId),
          eq(scrimRegistrations.mode, "squad")
        ));
      
      res.json({
        soloCount: soloRegistrations.length,
        duoCount: duoRegistrations.length,
        squadCount: squadRegistrations.length,
        totalSoloDuoSlots: 2, // Slots 99-100 are for solo/duo only
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch slots status" });
    }
  });

  app.get("/api/wallet/balance", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
      res.json({ balance: user?.walletBalance || "0" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  app.get("/api/wallet/transactions", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const txns = await db.select().from(transactions)
        .where(eq(transactions.userId, req.user!.id))
        .orderBy(desc(transactions.createdAt));
      res.json(txns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/wallet/add", authMiddleware, upload.single("screenshot"), async (req: AuthRequest, res) => {
    try {
      const { amount, utr } = req.body;
      const screenshot = req.file;

      await db.insert(transactions).values({
        userId: req.user!.id,
        type: "add",
        amount,
        utr: utr || null,
        screenshotUrl: screenshot ? `/uploads/${screenshot.filename}` : null,
        paymentStatus: "pending",
      });

      await sendWalletNotification(req.user!.email, req.user!.username, "add", amount);

      res.json({ message: "Add money request submitted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Request failed" });
    }
  });

  app.post("/api/wallet/withdraw", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { amount, upiId } = req.body;

      const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));

      if (parseFloat(user.walletBalance) < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      await db.insert(transactions).values({
        userId: req.user!.id,
        type: "withdraw",
        amount,
        utr: upiId,
        paymentStatus: "pending",
      });

      await sendWalletNotification(req.user!.email, req.user!.username, "withdraw", amount);

      res.json({ message: "Withdrawal request submitted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Request failed" });
    }
  });

  app.get("/api/profile/registrations", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const regs = await db.select({
        id: scrimRegistrations.id,
        paymentStatus: scrimRegistrations.paymentStatus,
        registeredAt: scrimRegistrations.registeredAt,
        scrim: scrims,
      })
        .from(scrimRegistrations)
        .leftJoin(scrims, eq(scrimRegistrations.scrimId, scrims.id))
        .where(eq(scrimRegistrations.userId, req.user!.id))
        .orderBy(desc(scrimRegistrations.registeredAt));

      res.json(regs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get("/api/teammates", async (req, res) => {
    try {
      const posts = await db.select({
        id: teammatesPosts.id,
        name: teammatesPosts.name,
        age: teammatesPosts.age,
        rank: teammatesPosts.rank,
        device: teammatesPosts.device,
        kd: teammatesPosts.kd,
        playstyle: teammatesPosts.playstyle,
        hasMic: teammatesPosts.hasMic,
        createdAt: teammatesPosts.createdAt,
        userId: teammatesPosts.userId,
      })
        .from(teammatesPosts)
        .orderBy(desc(teammatesPosts.createdAt));

      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/teammates", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const [post] = await db.insert(teammatesPosts).values({
        ...req.body,
        userId: req.user!.id,
      }).returning();

      res.json(post);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create post" });
    }
  });

  app.get("/api/leaderboard/:period", async (req, res) => {
    try {
      const { period } = req.params;
      const entries = await db.select({
        id: leaderboardEntries.id,
        kills: leaderboardEntries.kills,
        wins: leaderboardEntries.wins,
        avgSurvivalTime: leaderboardEntries.avgSurvivalTime,
        positionPoints: leaderboardEntries.positionPoints,
        user: users,
      })
        .from(leaderboardEntries)
        .leftJoin(users, eq(leaderboardEntries.userId, users.id))
        .where(eq(leaderboardEntries.period, period))
        .orderBy(desc(leaderboardEntries.positionPoints));

      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/admin/scrims", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const [scrim] = await db.insert(scrims).values({
        ...req.body,
        spotsRemaining: req.body.maxPlayers,
      }).returning();

      res.json(scrim);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create scrim" });
    }
  });

  app.get("/api/admin/scrims", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const allScrims = await db.select().from(scrims).orderBy(desc(scrims.createdAt));
      res.json(allScrims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scrims" });
    }
  });

  app.post("/api/admin/scrims/:id/room", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { roomId, roomPassword, youtubeLink } = req.body;

      const [scrim] = await db.select().from(scrims).where(eq(scrims.id, parseInt(id)));
      if (!scrim) {
        return res.status(404).json({ message: "Scrim not found" });
      }

      await db.update(scrims)
        .set({ roomId, roomPassword, youtubeLink })
        .where(eq(scrims.id, parseInt(id)));

      const registeredUsers = await db.select({
        userId: scrimRegistrations.userId,
        user: users,
      })
        .from(scrimRegistrations)
        .leftJoin(users, eq(scrimRegistrations.userId, users.id))
        .where(eq(scrimRegistrations.scrimId, parseInt(id)));

      for (const reg of registeredUsers) {
        if (reg.user) {
          await sendPaymentApproved(
            reg.user.email,
            reg.user.username,
            scrim.matchType,
            roomId,
            roomPassword,
            `${scrim.date} at ${scrim.time}`
          );
        }
      }

      res.json({ message: "Room details updated and notifications sent" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  app.post("/api/admin/scrims/:id/status", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await db.update(scrims)
        .set({ status })
        .where(eq(scrims.id, parseInt(id)));

      res.json({ message: "Status updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.delete("/api/admin/scrims/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const scrimId = parseInt(id);

      // Delete related registrations first
      await db.delete(scrimRegistrations)
        .where(eq(scrimRegistrations.scrimId, scrimId));

      // Delete the scrim
      await db.delete(scrims)
        .where(eq(scrims.id, scrimId));

      res.json({ message: "Scrim deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete scrim" });
    }
  });

  app.get("/api/admin/transactions", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const txns = await db.select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        utr: transactions.utr,
        screenshotUrl: transactions.screenshotUrl,
        paymentStatus: transactions.paymentStatus,
        scrimId: transactions.scrimId,
        createdAt: transactions.createdAt,
        user: users,
      })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .orderBy(desc(transactions.createdAt));

      res.json(txns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/admin/transactions/:id/approve", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      const [txn] = await db.select().from(transactions).where(eq(transactions.id, parseInt(id)));

      if (!txn) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, txn.userId));

      await db.update(transactions)
        .set({ paymentStatus: "verified" })
        .where(eq(transactions.id, parseInt(id)));

      if (txn.type === "add" || txn.type === "prize") {
        await db.update(users)
          .set({ walletBalance: sql`${users.walletBalance} + ${txn.amount}` })
          .where(eq(users.id, txn.userId));

        if (user) {
          await sendWalletNotification(user.email, user.username, "add", txn.amount);
        }
      } else if (txn.type === "withdraw") {
        await db.update(users)
          .set({ walletBalance: sql`${users.walletBalance} - ${txn.amount}` })
          .where(eq(users.id, txn.userId));

        if (user) {
          await sendWalletNotification(user.email, user.username, "withdraw", txn.amount);
        }
      } else if (txn.type === "entryFee" && txn.scrimId) {
        await db.update(users)
          .set({ walletBalance: sql`${users.walletBalance} - ${txn.amount}` })
          .where(eq(users.id, txn.userId));

        await db.update(scrimRegistrations)
          .set({ paymentStatus: "verified" })
          .where(and(
            eq(scrimRegistrations.scrimId, txn.scrimId),
            eq(scrimRegistrations.userId, txn.userId)
          ));

        await db.update(scrims)
          .set({ spotsRemaining: sql`${scrims.spotsRemaining} - 1` })
          .where(eq(scrims.id, txn.scrimId));

        const [scrim] = await db.select().from(scrims).where(eq(scrims.id, txn.scrimId));
        if (user && scrim) {
          await sendPaymentConfirmation(user.email, user.username, txn.amount, scrim.matchType);
        }
      }

      res.json({ message: "Transaction approved" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to approve" });
    }
  });

  app.post("/api/admin/transactions/:id/reject", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      await db.update(transactions)
        .set({ paymentStatus: "rejected" })
        .where(eq(transactions.id, parseInt(id)));

      res.json({ message: "Transaction rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject" });
    }
  });

  app.get("/api/admin/players", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const allPlayers = await db.select().from(users).orderBy(desc(users.createdAt));
      const playersWithoutPasswords = allPlayers.map(({ password, ...user }) => user);
      res.json(playersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.post("/api/admin/players/:id/ban", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      await db.update(users)
        .set({ banned: true })
        .where(eq(users.id, parseInt(id)));

      res.json({ message: "Player banned" });
    } catch (error) {
      res.status(500).json({ message: "Failed to ban player" });
    }
  });

  app.post("/api/admin/players/:id/unban", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      await db.update(users)
        .set({ banned: false })
        .where(eq(users.id, parseInt(id)));

      res.json({ message: "Player unbanned" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban player" });
    }
  });

  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  interface ChatClient {
    ws: WebSocket;
    userId: number;
    postId: number;
  }

  const clients: ChatClient[] = [];

  wss.on("connection", (ws: WebSocket) => {
    let currentClient: ChatClient | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "join") {
          currentClient = { ws, userId: 0, postId: message.postId };
          clients.push(currentClient);

          const history = await db.select({
            id: chatMessages.id,
            message: chatMessages.message,
            userId: chatMessages.userId,
            createdAt: chatMessages.createdAt,
          })
            .from(chatMessages)
            .where(eq(chatMessages.postId, message.postId))
            .orderBy(chatMessages.createdAt);

          ws.send(JSON.stringify({ type: "history", messages: history }));
        } else if (message.type === "message" && currentClient) {
          if (containsBadWords(message.message)) {
            ws.send(JSON.stringify({ type: "blocked" }));
            return;
          }

          const [newMessage] = await db.insert(chatMessages).values({
            postId: message.postId,
            userId: message.userId || 1,
            message: message.message,
          }).returning();

          clients
            .filter(c => c.postId === message.postId && c.ws.readyState === WebSocket.OPEN)
            .forEach(c => {
              c.ws.send(JSON.stringify({ type: "message", message: newMessage }));
            });
        } else if (message.type === "report") {
          await db.update(chatMessages)
            .set({ reported: true })
            .where(eq(chatMessages.id, message.messageId));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      if (currentClient) {
        const index = clients.indexOf(currentClient);
        if (index > -1) clients.splice(index, 1);
      }
    });
  });

  return httpServer;
}
