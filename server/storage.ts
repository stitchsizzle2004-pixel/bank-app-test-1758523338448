import { type Account, type InsertAccount, type Transaction, type InsertTransaction, type TransactionWithDetails, type DashboardStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Account operations
  getAccount(id: string): Promise<Account | undefined>;
  getAccountByNumber(accountNumber: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(accountNumber: number, newBalance: number): Promise<Account>;
  getAllAccounts(): Promise<Account[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getRecentTransactions(limit?: number): Promise<TransactionWithDetails[]>;
  
  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private accounts: Map<string, Account>;
  private transactions: Map<string, Transaction>;

  constructor() {
    this.accounts = new Map();
    this.transactions = new Map();
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountByNumber(accountNumber: number): Promise<Account | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.accountNumber === accountNumber,
    );
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    // Check if account number already exists
    const existing = await this.getAccountByNumber(insertAccount.accountNumber);
    if (existing) {
      throw new Error(`Account ${insertAccount.accountNumber} already exists`);
    }

    const id = randomUUID();
    const account: Account = { 
      ...insertAccount, 
      id,
      balance: insertAccount.balance ?? 0,
      createdAt: new Date()
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccountBalance(accountNumber: number, newBalance: number): Promise<Account> {
    const account = await this.getAccountByNumber(accountNumber);
    if (!account) {
      throw new Error(`Account ${accountNumber} not found`);
    }

    const updatedAccount = { ...account, balance: newBalance };
    this.accounts.set(account.id, updatedAccount);
    return updatedAccount;
  }

  async getAllAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values()).sort((a, b) => a.accountNumber - b.accountNumber);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      fromAccountId: insertTransaction.fromAccountId ?? null,
      toAccountId: insertTransaction.toAccountId ?? null,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getRecentTransactions(limit: number = 10): Promise<TransactionWithDetails[]> {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    const transactionsWithDetails: TransactionWithDetails[] = [];

    for (const transaction of transactions) {
      const transactionWithDetails: TransactionWithDetails = { ...transaction };

      if (transaction.fromAccountId) {
        const fromAccount = await this.getAccount(transaction.fromAccountId);
        if (fromAccount) {
          transactionWithDetails.fromAccount = {
            accountNumber: fromAccount.accountNumber,
            name: fromAccount.name
          };
        }
      }

      if (transaction.toAccountId) {
        const toAccount = await this.getAccount(transaction.toAccountId);
        if (toAccount) {
          transactionWithDetails.toAccount = {
            accountNumber: toAccount.accountNumber,
            name: toAccount.name
          };
        }
      }

      transactionsWithDetails.push(transactionWithDetails);
    }

    return transactionsWithDetails;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const accounts = await this.getAllAccounts();
    const transactions = Array.from(this.transactions.values());

    const totalDeposits = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);

    const activeTransfers = transactions
      .filter(t => t.type === 'transfer')
      .length;

    return {
      totalAccounts: accounts.length,
      totalDeposits: `$${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      totalWithdrawals: `$${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      activeTransfers
    };
  }
}

export const storage = new MemStorage();
