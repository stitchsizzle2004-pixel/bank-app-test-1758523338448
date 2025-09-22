import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Search, 
  Eye, 
  Plus, 
  Minus, 
  User
} from "lucide-react";
import { api } from "@/lib/api";
import type { Account } from "@shared/schema";

export default function Accounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: accounts, isLoading, refetch } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: api.getAllAccounts
  });

  const filteredAccounts = accounts?.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.toString().includes(searchTerm);
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "active") return matchesSearch; // All accounts are active
    if (filterType === "high-balance") return matchesSearch && account.balance >= 10000;
    if (filterType === "recent") return matchesSearch; // Could be enhanced with creation date filter
    
    return matchesSearch;
  }) || [];

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const accountDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - accountDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">All Accounts</h1>
        <p className="text-muted-foreground">Manage and view all bank accounts</p>
      </div>

      <Card>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-foreground">Accounts Overview</h3>
            <Button 
              onClick={() => refetch()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-refresh"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search accounts by number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter">
                <SelectValue placeholder="Filter accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="high-balance">High Balance</SelectItem>
                <SelectItem value="recent">Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Account Number</th>
                <th className="text-left p-4 font-medium text-foreground">Account Holder</th>
                <th className="text-right p-4 font-medium text-foreground">Balance</th>
                <th className="text-left p-4 font-medium text-foreground">Status</th>
                <th className="text-left p-4 font-medium text-foreground">Created</th>
                <th className="text-center p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Skeleton className="h-6 w-24 ml-auto" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredAccounts.length > 0 ? (
                filteredAccounts.map((account) => (
                  <tr 
                    key={account.id} 
                    className="border-b border-border hover:bg-secondary/20 transition-colors"
                    data-testid={`row-account-${account.accountNumber}`}
                  >
                    <td className="p-4">
                      <span className="font-mono text-primary font-medium">
                        #{account.accountNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <User className="text-primary h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{account.name}</p>
                          <p className="text-sm text-muted-foreground">Personal Account</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-xl text-foreground">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(account.createdAt)}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 text-blue-600 hover:bg-blue-100"
                          title="View Details"
                          data-testid={`button-view-${account.accountNumber}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 text-green-600 hover:bg-green-100"
                          title="Quick Deposit"
                          data-testid={`button-deposit-${account.accountNumber}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="p-2 text-red-600 hover:bg-red-100"
                          title="Quick Withdraw"
                          data-testid={`button-withdraw-${account.accountNumber}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <User className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No accounts found matching your search' : 'No accounts available'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAccounts.length > 0 && (
          <div className="p-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAccounts.length} of {accounts?.length || 0} accounts
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
