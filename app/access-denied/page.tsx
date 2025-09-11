"use client";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Mail, LogOut } from "lucide-react";
import { AuthHeader } from "@/components/auth-header";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Header simplified with only theme toggle */}
      <AuthHeader />

      <div className="grid w-full min-h-screen items-center px-4 sm:justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* title and subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Edge Intelligence Hub
            </h1>
          </div>

          {/* Card access denied */}
          <Card className="shadow-lg border border-destructive/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-destructive">
                  Acesso Negado
                </CardTitle>
                <CardDescription className="mt-2">
                  Este aplicativo é restrito
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Information about domain */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  Domínio Requerido
                </div>
                <p className="text-sm text-muted-foreground">
                  Para acessar esta aplicação, você precisa fazer login com um
                  e-mail corporativo
                </p>
              </div>

              {/* Logout button */}
              <div className="pt-2">
                <SignOutButton>
                  <Button className="w-full" size="lg">
                    <LogOut className="w-4 h-4 mr-2" />
                    Fazer Logout e Tentar Novamente
                  </Button>
                </SignOutButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
