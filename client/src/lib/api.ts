import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => fetch("/api/dashboard/stats").then(res => res.json()),
  getRecentTransactions: (limit = 10) => fetch(`/api/transactions/recent?limit=${limit}`).then(res => res.json()),
  
  // Accounts
  createAccount: (data: { accountNumber: number; name: string; balance: number }) =>
    apiRequest("POST", "/api/accounts", data),
  
  getAllAccounts: () => fetch("/api/accounts").then(res => res.json()),
  
  getAccountByNumber: (accountNumber: number) =>
    fetch(`/api/accounts/${accountNumber}`).then(res => res.json()),
  
  // Transactions
  deposit: (accountNumber: number, amount: number) =>
    apiRequest("POST", `/api/accounts/${accountNumber}/deposit`, { amount }),
  
  withdraw: (accountNumber: number, amount: number) =>
    apiRequest("POST", `/api/accounts/${accountNumber}/withdraw`, { amount }),
  
  transfer: (fromAccountNumber: number, toAccountNumber: number, amount: number) =>
    apiRequest("POST", "/api/accounts/transfer", { fromAccountNumber, toAccountNumber, amount }),
  
  // GitHub deployment
  deployToGitHub: (repoName: string, description?: string) =>
    apiRequest("POST", "/api/deploy-to-github", { repoName, description }),
};
