import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Github, Loader2, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

const deploySchema = z.object({
  repoName: z.string().min(1, "Repository name is required").max(100, "Repository name must be less than 100 characters"),
  description: z.string().optional(),
});

type DeployForm = z.infer<typeof deploySchema>;

export default function GitHubDeploy() {
  const { toast } = useToast();
  const [deployResult, setDeployResult] = useState<{url: string; message: string} | null>(null);

  const form = useForm<DeployForm>({
    resolver: zodResolver(deploySchema),
    defaultValues: {
      repoName: "bank-management-system",
      description: "Bank Management System - Web application with C-backend logic converted to JavaScript",
    },
  });

  const deployMutation = useMutation({
    mutationFn: (data: DeployForm) => api.deployToGitHub(data.repoName, data.description),
    onSuccess: async (response) => {
      const result = await response.json();
      setDeployResult(result);
      toast({
        variant: "default",
        title: "Success!",
        description: "Repository created successfully on GitHub!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to deploy to GitHub. Please try again.",
      });
    },
  });

  const onSubmit = (data: DeployForm) => {
    deployMutation.mutate(data);
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Deploy to GitHub</h1>
        <p className="text-muted-foreground">Save your banking application to a GitHub repository</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardContent className="p-8">
            {!deployResult ? (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="repoName" className="block text-sm font-medium text-foreground mb-2">
                    Repository Name
                  </Label>
                  <Input
                    id="repoName"
                    type="text"
                    placeholder="bank-management-system"
                    className="w-full"
                    data-testid="input-repo-name"
                    {...form.register("repoName")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Choose a unique name for your repository</p>
                  {form.formState.errors.repoName && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.repoName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Repository Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Bank Management System - Web application with C-backend logic converted to JavaScript"
                    className="w-full"
                    rows={3}
                    data-testid="input-description"
                    {...form.register("description")}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional description for your repository</p>
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Github className="text-blue-600 h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">About GitHub Deployment</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This will create a new public repository on your GitHub account and upload all your banking application files including:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                        <li>Complete frontend React application</li>
                        <li>Express.js backend with all API endpoints</li>
                        <li>TypeScript schemas and configurations</li>
                        <li>All styling and UI components</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                  disabled={deployMutation.isPending}
                  data-testid="button-deploy"
                >
                  {deployMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying to GitHub...
                    </>
                  ) : (
                    <>
                      <Github className="mr-2 h-4 w-4" />
                      Deploy to GitHub
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Github className="text-green-600 h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Successfully Deployed!
                  </h3>
                  <p className="text-green-700 mb-4">
                    {deployResult.message}
                  </p>
                  <Button
                    asChild
                    className="bg-green-600 text-white hover:bg-green-700"
                    data-testid="button-view-repo"
                  >
                    <a 
                      href={deployResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Repository
                    </a>
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeployResult(null);
                    form.reset();
                  }}
                  data-testid="button-deploy-another"
                >
                  Deploy Another Repository
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}