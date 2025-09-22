import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountNumber: integer("account_number").notNull().unique(),
  name: text("name").notNull(),
  balance: real("balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'transfer'
  fromAccountId: varchar("from_account_id").references(() => accounts.id),
  toAccountId: varchar("to_account_id").references(() => accounts.id),
  amount: real("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// API response types
export type TransactionWithDetails = Transaction & {
  fromAccount?: Pick<Account, 'accountNumber' | 'name'>;
  toAccount?: Pick<Account, 'accountNumber' | 'name'>;
};

export type DashboardStats = {
  totalAccounts: number;
  totalDeposits: string;
  totalWithdrawals: string;
  activeTransfers: number;
};
