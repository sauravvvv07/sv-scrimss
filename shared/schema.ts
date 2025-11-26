import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  mobile: text("mobile"),
  playerId: text("player_id").notNull().unique(),
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  role: text("role").notNull().default("player"),
  banned: boolean("banned").notNull().default(false),
  totalKills: integer("total_kills").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalMatches: integer("total_matches").notNull().default(0),
  avgSurvivalTime: integer("avg_survival_time").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scrims = pgTable("scrims", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  matchType: text("match_type").notNull(),
  map: text("map").notNull(),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  maxPlayers: integer("max_players").notNull(),
  spotsRemaining: integer("spots_remaining").notNull(),
  roomId: text("room_id"),
  roomPassword: text("room_password"),
  youtubeLink: text("youtube_link"),
  spectatorLink: text("spectator_link"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scrimRegistrations = pgTable("scrim_registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  scrimId: integer("scrim_id").notNull().references(() => scrims.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paymentStatus: text("payment_status").notNull().default("pending"),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  utr: text("utr"),
  screenshotUrl: text("screenshot_url"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  scrimId: integer("scrim_id").references(() => scrims.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teammatesPosts = pgTable("teammates_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  rank: text("rank").notNull(),
  device: text("device").notNull(),
  kd: text("kd").notNull(),
  playstyle: text("playstyle").notNull(),
  hasMic: boolean("has_mic").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  postId: integer("post_id").notNull().references(() => teammatesPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  reported: boolean("reported").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  kills: integer("kills").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  avgSurvivalTime: integer("avg_survival_time").notNull().default(0),
  positionPoints: integer("position_points").notNull().default(0),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  registrations: many(scrimRegistrations),
  transactions: many(transactions),
  teammatesPosts: many(teammatesPosts),
  chatMessages: many(chatMessages),
  leaderboardEntries: many(leaderboardEntries),
}));

export const scrimsRelations = relations(scrims, ({ many }) => ({
  registrations: many(scrimRegistrations),
  transactions: many(transactions),
}));

export const scrimRegistrationsRelations = relations(scrimRegistrations, ({ one }) => ({
  scrim: one(scrims, { fields: [scrimRegistrations.scrimId], references: [scrims.id] }),
  user: one(users, { fields: [scrimRegistrations.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  scrim: one(scrims, { fields: [transactions.scrimId], references: [scrims.id] }),
}));

export const teammatesPostsRelations = relations(teammatesPosts, ({ one, many }) => ({
  user: one(users, { fields: [teammatesPosts.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  post: one(teammatesPosts, { fields: [chatMessages.postId], references: [teammatesPosts.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  user: one(users, { fields: [leaderboardEntries.userId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  playerId: true,
  walletBalance: true,
  role: true,
  banned: true,
  totalKills: true,
  totalWins: true,
  totalMatches: true,
  avgSurvivalTime: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertScrimSchema = createInsertSchema(scrims).omit({
  id: true,
  spotsRemaining: true,
  status: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  paymentStatus: true,
  createdAt: true,
});

export const insertTeammatesPostSchema = createInsertSchema(teammatesPosts).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  reported: true,
  createdAt: true,
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Scrim = typeof scrims.$inferSelect;
export type InsertScrim = z.infer<typeof insertScrimSchema>;
export type ScrimRegistration = typeof scrimRegistrations.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TeammatesPost = typeof teammatesPosts.$inferSelect;
export type InsertTeammatesPost = z.infer<typeof insertTeammatesPostSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
