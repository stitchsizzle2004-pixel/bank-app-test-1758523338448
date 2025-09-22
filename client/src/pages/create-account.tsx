import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const createAccountSchema = z.object({
  accountNumber: z.number().min(1, "Account number must be positive"),
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  balance: z.number().min(0, "Initial balance cannot be negative"),
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

export default function CreateAccount() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateAccountForm>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      accountNumber: 0,
      name: "",
      balance: 0,
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: CreateAccountForm) => api.createAccount(data),
    onSuccess: (response) => {
      const account = response.json();
      toast({
        variant: "default",
        title: "Success!",
        description: `Account #${form.getValues().accountNumber} created successfully!`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
      });
    },
  });

  const onSubmit = (data: CreateAccountForm) => {
    createAccountMutation.mutate(data);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Create New Account</h1>
        <p className="text-muted-foreground">Set up a new bank account with initial details</p>
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
                  placeholder="Enter unique account number"
                  className="w-full"
                  data-testid="input-account-number"
                  {...form.register("accountNumber", { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground mt-1">Must be unique and numeric</p>
                {form.formState.errors.accountNumber && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.accountNumber.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Account Holder Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  className="w-full"
                  data-testid="input-holder-name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="balance" className="block text-sm font-medium text-foreground mb-2">
                  Initial Balance
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8"
                    data-testid="input-initial-balance"
                    {...form.register("balance", { valueAsNumber: true })}
                  />
                </div>
                {form.formState.errors.balance && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.balance.message}
                  </p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={createAccountMutation.isPending}
                  data-testid="button-create-account"
                >
                  {createAccountMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                  data-testid="button-reset-form"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
