import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MinusCircle, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import type { Account } from "@shared/schema";

const withdrawSchema = z.object({
  accountNumber: z.number().min(1, "Account number must be positive"),
  amount: z.number().min(0.01, "Amount must be at least $0.01"),
});

type WithdrawForm = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const form = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      accountNumber: 0,
      amount: 0,
    },
  });

  const accountNumber = form.watch("accountNumber");
  const amount = form.watch("amount");

  // Query to get account details when account number is entered
  const { data: account } = useQuery({
    queryKey: ["/api/accounts", accountNumber],
    queryFn: () => api.getAccountByNumber(accountNumber),
    enabled: !!accountNumber && accountNumber > 0,
    retry: false,
  });

  useEffect(() => {
    if (account) {
      setSelectedAccount(account);
    } else {
      setSelectedAccount(null);
    }
  }, [account]);

  const remainingBalance = selectedAccount ? selectedAccount.balance - (amount || 0) : 0;
  const hasInsufficientFunds = remainingBalance < 0;

  const withdrawMutation = useMutation({
    mutationFn: (data: WithdrawForm) => api.withdraw(data.accountNumber, data.amount),
    onSuccess: (response) => {
      const result = response.json();
      toast({
        variant: "default",
        title: "Success!",
        description: `Withdrawal of $${form.getValues().amount.toFixed(2)} processed successfully!`,
      });
      form.reset();
      setSelectedAccount(null);
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process withdrawal. Please try again.",
      });
    },
  });

  const onSubmit = (data: WithdrawForm) => {
    if (!selectedAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid account number",
      });
      return;
    }

    if (hasInsufficientFunds) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Insufficient funds for this withdrawal",
      });
      return;
    }

    withdrawMutation.mutate(data);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Remove funds from an existing account</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="accountNumber" className="block text-sm font-medium text-foreground mb-2">
                  Account Number
                </Label>
                <Input
                  id="accountNumber"
                  type="number"
                  placeholder="Enter account number"
                  className="w-full"
                  data-testid="input-account-number"
                  {...form.register("accountNumber", { valueAsNumber: true })}
                />
                {form.formState.errors.accountNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                  Withdrawal Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="w-full pl-8"
                    data-testid="input-amount"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              {/* Account Preview */}
              {selectedAccount && (
                <div 
                  className={`border p-4 rounded-lg ${hasInsufficientFunds ? 'bg-red-50 border-red-200' : 'bg-secondary/50 border-border'}`}
                  data-testid="withdraw-preview"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{selectedAccount.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Available Balance: ${selectedAccount.balance.toFixed(2)}
                      </p>
                      {amount > 0 && (
                        <p className={`text-sm font-medium ${hasInsufficientFunds ? 'text-red-600' : 'text-foreground'}`}>
                          After Withdrawal: ${remainingBalance.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg ${hasInsufficientFunds ? 'bg-red-100' : 'bg-orange-100'}`}>
                      <AlertTriangle className={`h-5 w-5 ${hasInsufficientFunds ? 'text-red-600' : 'text-orange-600'}`} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                  disabled={withdrawMutation.isPending || !selectedAccount || hasInsufficientFunds}
                  data-testid="button-process-withdrawal"
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MinusCircle className="mr-2 h-4 w-4" />
                      Process Withdrawal
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    setSelectedAccount(null);
                  }}
                  data-testid="button-clear-form"
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
