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
import { ArrowLeftRight, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Account } from "@shared/schema";

const transferSchema = z.object({
  fromAccountNumber: z.number().min(1, "From account number must be positive"),
  toAccountNumber: z.number().min(1, "To account number must be positive"),
  amount: z.number().min(0.01, "Amount must be at least $0.01"),
}).refine(data => data.fromAccountNumber !== data.toAccountNumber, {
  message: "Cannot transfer to the same account",
  path: ["toAccountNumber"],
});

type TransferForm = z.infer<typeof transferSchema>;

export default function Transfer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);

  const form = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountNumber: 0,
      toAccountNumber: 0,
      amount: 0,
    },
  });

  const fromAccountNumber = form.watch("fromAccountNumber");
  const toAccountNumber = form.watch("toAccountNumber");
  const amount = form.watch("amount");

  // Query to get from account details
  const { data: fromAccountData } = useQuery({
    queryKey: ["/api/accounts", fromAccountNumber],
    queryFn: () => api.getAccountByNumber(fromAccountNumber),
    enabled: !!fromAccountNumber && fromAccountNumber > 0,
    retry: false,
  });

  // Query to get to account details
  const { data: toAccountData } = useQuery({
    queryKey: ["/api/accounts", toAccountNumber],
    queryFn: () => api.getAccountByNumber(toAccountNumber),
    enabled: !!toAccountNumber && toAccountNumber > 0,
    retry: false,
  });

  useEffect(() => {
    setFromAccount(fromAccountData || null);
  }, [fromAccountData]);

  useEffect(() => {
    setToAccount(toAccountData || null);
  }, [toAccountData]);

  const hasInsufficientFunds = fromAccount ? fromAccount.balance < (amount || 0) : false;
  const canShowPreview = fromAccount && toAccount && amount > 0;

  const transferMutation = useMutation({
    mutationFn: (data: TransferForm) => api.transfer(data.fromAccountNumber, data.toAccountNumber, data.amount),
    onSuccess: (response) => {
      const result = response.json();
      toast({
        variant: "default",
        title: "Success!",
        description: `Transfer of $${form.getValues().amount.toFixed(2)} completed successfully!`,
      });
      form.reset();
      setFromAccount(null);
      setToAccount(null);
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/recent"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process transfer. Please try again.",
      });
    },
  });

  const onSubmit = (data: TransferForm) => {
    if (!fromAccount || !toAccount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter valid account numbers for both accounts",
      });
      return;
    }

    if (hasInsufficientFunds) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Insufficient funds in source account",
      });
      return;
    }

    transferMutation.mutate(data);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Transfer Funds</h1>
        <p className="text-muted-foreground">Move money between accounts</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fromAccountNumber" className="block text-sm font-medium text-foreground mb-2">
                    From Account
                  </Label>
                  <Input
                    id="fromAccountNumber"
                    type="number"
                    placeholder="Sender account number"
                    className="w-full"
                    data-testid="input-from-account"
                    {...form.register("fromAccountNumber", { valueAsNumber: true })}
                  />
                  {form.formState.errors.fromAccountNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.fromAccountNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="toAccountNumber" className="block text-sm font-medium text-foreground mb-2">
                    To Account
                  </Label>
                  <Input
                    id="toAccountNumber"
                    type="number"
                    placeholder="Receiver account number"
                    className="w-full"
                    data-testid="input-to-account"
                    {...form.register("toAccountNumber", { valueAsNumber: true })}
                  />
                  {form.formState.errors.toAccountNumber && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.toAccountNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                  Transfer Amount
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

              {/* Transfer Preview */}
              {canShowPreview && (
                <div 
                  className={`border p-4 rounded-lg space-y-4 ${hasInsufficientFunds ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}
                  data-testid="transfer-preview"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">From</p>
                      <p className="text-sm text-muted-foreground">{fromAccount.name}</p>
                      <p className={`text-sm ${hasInsufficientFunds ? 'text-red-600 font-medium' : 'text-blue-600'}`}>
                        Balance: ${fromAccount.balance.toFixed(2)}
                      </p>
                      {hasInsufficientFunds && (
                        <p className="text-xs text-red-600 font-medium">Insufficient funds!</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">To</p>
                      <p className="text-sm text-muted-foreground">{toAccount.name}</p>
                      <p className="text-sm text-green-600">
                        Balance: ${toAccount.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <ArrowRight className="text-blue-600 h-5 w-5 mx-auto" />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  disabled={transferMutation.isPending || !fromAccount || !toAccount || hasInsufficientFunds}
                  data-testid="button-process-transfer"
                >
                  {transferMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Process Transfer
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    setFromAccount(null);
                    setToAccount(null);
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
