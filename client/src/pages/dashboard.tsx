import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Users, 
  PlusCircle, 
  MinusCircle, 
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Search
} from "lucide-react";
import { api } from "@/lib/api";
import type { DashboardStats, TransactionWithDetails } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery<TransactionWithDetails[]>({
    queryKey: ["/api/transactions/recent"],
    queryFn: () => api.getRecentTransactions(5)
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <PlusCircle className="text-green-600 h-5 w-5" />;
      case 'withdraw':
        return <MinusCircle className="text-red-600 h-5 w-5" />;
      case 'transfer':
        return <ArrowLeftRight className="text-blue-600 h-5 w-5" />;
      default:
        return <PlusCircle className="h-5 w-5" />;
    }
  };

  const formatTransactionAmount = (transaction: TransactionWithDetails) => {
    const amount = `$${transaction.amount.toFixed(2)}`;
    switch (transaction.type) {
      case 'deposit':
        return <span className="font-semibold text-green-600">+{amount}</span>;
      case 'withdraw':
        return <span className="font-semibold text-red-600">-{amount}</span>;
      case 'transfer':
        return <span className="font-semibold text-foreground">{amount}</span>;
      default:
        return amount;
    }
  };

  const getTransactionDescription = (transaction: TransactionWithDetails) => {
    switch (transaction.type) {
      case 'deposit':
        return `Deposit • ${transaction.toAccount?.name || 'Unknown'}`;
      case 'withdraw':
        return `Withdrawal • ${transaction.fromAccount?.name || 'Unknown'}`;
      case 'transfer':
        return `Transfer • ${transaction.fromAccount?.accountNumber} → ${transaction.toAccount?.accountNumber}`;
      default:
        return 'Transaction';
    }
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your banking operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live System</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Accounts</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-accounts">
                    {stats?.totalAccounts || 0}
                  </p>
                )}
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="text-primary text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-600 font-medium">+2.5%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Deposits</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-deposits">
                    {stats?.totalDeposits || '$0.00'}
                  </p>
                )}
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <PlusCircle className="text-green-600 text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-600 font-medium">+12.3%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Withdrawals</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-withdrawals">
                    {stats?.totalWithdrawals || '$0.00'}
                  </p>
                )}
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <MinusCircle className="text-red-600 text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="text-red-500 mr-1 h-4 w-4" />
              <span className="text-red-600 font-medium">-3.2%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Transfers</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-foreground" data-testid="text-active-transfers">
                    {stats?.activeTransfers || 0}
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ArrowLeftRight className="text-blue-600 text-xl h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="text-green-500 mr-1 h-4 w-4" />
              <span className="text-green-600 font-medium">+8.7%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </div>
            </div>
            <CardContent className="p-6">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {getTransactionDescription(transaction)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {formatTransactionAmount(transaction)}
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
            </div>
            <CardContent className="p-6 space-y-4">
              <Link href="/create-account">
                <Button 
                  className="w-full flex items-center space-x-3 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="button-new-account"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>New Account</span>
                </Button>
              </Link>
              
              <Link href="/deposit">
                <Button 
                  className="w-full flex items-center space-x-3 bg-green-600 text-white hover:bg-green-700"
                  data-testid="button-quick-deposit"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Quick Deposit</span>
                </Button>
              </Link>
              
              <Link href="/transfer">
                <Button 
                  className="w-full flex items-center space-x-3 bg-blue-600 text-white hover:bg-blue-700"
                  data-testid="button-transfer-funds"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                  <span>Transfer Funds</span>
                </Button>
              </Link>
              
              <Link href="/accounts">
                <Button 
                  variant="secondary" 
                  className="w-full flex items-center space-x-3"
                  data-testid="button-find-account"
                >
                  <Search className="h-5 w-5" />
                  <span>Find Account</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
