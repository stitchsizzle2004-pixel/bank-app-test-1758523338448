import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema } from "@shared/schema";
import { z } from "zod";
import { deployToGitHub } from "./deploy-to-github";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard stats" });
    }
  });

  // Get recent transactions
  app.get("/api/transactions/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent transactions" });
    }
  });

  // Create account
  app.post("/api/accounts", async (req, res) => {
    try {
      const validatedData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(validatedData);
      
      // Create initial transaction record if balance > 0
      if (account.balance > 0) {
        await storage.createTransaction({
          type: 'deposit',
          toAccountId: account.id,
          fromAccountId: null,
          amount: account.balance
        });
      }
      
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid account data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  // Get all accounts
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAllAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get accounts" });
    }
  });

  // Get account by number
  app.get("/api/accounts/:accountNumber", async (req, res) => {
    try {
      const accountNumber = parseInt(req.params.accountNumber);
      const account = await storage.getAccountByNumber(accountNumber);
      
      if (!account) {
        res.status(404).json({ message: `Account ${accountNumber} not found` });
        return;
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to get account" });
    }
  });

  // Deposit
  app.post("/api/accounts/:accountNumber/deposit", async (req, res) => {
    try {
      const accountNumber = parseInt(req.params.accountNumber);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ message: "Amount must be positive" });
        return;
      }

      const account = await storage.getAccountByNumber(accountNumber);
      if (!account) {
        res.status(404).json({ message: `Account ${accountNumber} not found` });
        return;
      }

      const newBalance = account.balance + amount;
      const updatedAccount = await storage.updateAccountBalance(accountNumber, newBalance);

      // Record transaction
      await storage.createTransaction({
        type: 'deposit',
        toAccountId: account.id,
        fromAccountId: null,
        amount: amount
      });

      res.json({ 
        account: updatedAccount, 
        message: `Deposit successful! New Balance: $${newBalance.toFixed(2)}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Withdraw
  app.post("/api/accounts/:accountNumber/withdraw", async (req, res) => {
    try {
      const accountNumber = parseInt(req.params.accountNumber);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ message: "Amount must be positive" });
        return;
      }

      const account = await storage.getAccountByNumber(accountNumber);
      if (!account) {
        res.status(404).json({ message: `Account ${accountNumber} not found` });
        return;
      }

      if (account.balance < amount) {
        res.status(400).json({ message: "Insufficient funds" });
        return;
      }

      const newBalance = account.balance - amount;
      const updatedAccount = await storage.updateAccountBalance(accountNumber, newBalance);

      // Record transaction
      await storage.createTransaction({
        type: 'withdraw',
        fromAccountId: account.id,
        toAccountId: null,
        amount: amount
      });

      res.json({ 
        account: updatedAccount, 
        message: `Withdrawal successful! New Balance: $${newBalance.toFixed(2)}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Transfer
  app.post("/api/accounts/transfer", async (req, res) => {
    try {
      const { fromAccountNumber, toAccountNumber, amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({ message: "Amount must be positive" });
        return;
      }

      if (fromAccountNumber === toAccountNumber) {
        res.status(400).json({ message: "Cannot transfer to the same account" });
        return;
      }

      const fromAccount = await storage.getAccountByNumber(fromAccountNumber);
      const toAccount = await storage.getAccountByNumber(toAccountNumber);

      if (!fromAccount || !toAccount) {
        res.status(404).json({ message: "One or both accounts not found" });
        return;
      }

      if (fromAccount.balance < amount) {
        res.status(400).json({ message: "Insufficient funds in source account" });
        return;
      }

      // Update balances
      const newFromBalance = fromAccount.balance - amount;
      const newToBalance = toAccount.balance + amount;

      await storage.updateAccountBalance(fromAccountNumber, newFromBalance);
      await storage.updateAccountBalance(toAccountNumber, newToBalance);

      // Record transaction
      await storage.createTransaction({
        type: 'transfer',
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: amount
      });

      res.json({ 
        fromAccount: { ...fromAccount, balance: newFromBalance },
        toAccount: { ...toAccount, balance: newToBalance },
        message: `Transfer successful! Sender Balance: $${newFromBalance.toFixed(2)} | Receiver Balance: $${newToBalance.toFixed(2)}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process transfer" });
    }
  });

  // GitHub deployment endpoint
  app.post("/api/deploy-to-github", async (req, res) => {
    try {
      const { repoName, description } = req.body;
      
      if (!repoName) {
        res.status(400).json({ message: "Repository name is required" });
        return;
      }
      
      const result = await deployToGitHub(
        repoName, 
        description || "Bank Management System - Web application with C-backend logic converted to JavaScript"
      );
      
      if (result.success) {
        res.json({
          success: true,
          url: result.url,
          message: result.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to deploy to GitHub" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
