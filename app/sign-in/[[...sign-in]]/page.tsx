import { SignIn } from "@clerk/nextjs";
import { AuthHeader } from "@/components/auth-header";

export default function Page() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Simplified header with only theme toggle */}
      <AuthHeader />  

      

      {/* Centered layout inspired by Clerk's best practices */}
      <div className="grid w-full min-h-screen items-center px-4 sm:justify-center">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Logo e título da empresa */}
          <div className="text-center space-y-4">
            {/* Logo da empresa */}
            <div className="flex justify-center">
              <img 
                src="/logos/logo.png" 
                alt="EspiADinha Logo" 
                className="h-16 w-auto"
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EspiADinha
              </h1>
              <p className="text-sm text-muted-foreground">
                Faça login para acessar a plataforma
              </p>
            </div>
          </div>

          {/* Clerk Sign In component */}
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-lg border",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "iconButton",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
