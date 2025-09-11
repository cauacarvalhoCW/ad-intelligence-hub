import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, User, Mail, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import Link from "next/link";

export default async function ProtectedPage() {
  // Verify authentication
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  // Get user data
  const user = await currentUser();

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-green-500" />
                Área Protegida
              </h1>
              <p className="text-muted-foreground">
                Esta página só é acessível para usuários autenticados
              </p>
            </div>
          </div>

          <div className="grid gap-6 max-w-2xl">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Usuário
                </CardTitle>
                <CardDescription>
                  Dados obtidos através da autenticação com Clerk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.imageUrl && (
                  <div className="flex items-center gap-4">
                    <img
                      src={user.imageUrl}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2 border-border"
                    />
                    <div>
                      <p className="font-medium">Foto de perfil</p>
                      <p className="text-sm text-muted-foreground">
                        Gerenciada pelo Clerk
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm">
                      {user?.firstName || "N/A"} {user?.lastName || ""}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email:
                    </span>
                    <span className="text-sm">
                      {user?.primaryEmailAddress?.emailAddress || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ID do Usuário:</span>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {userId}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Criado em:
                    </span>
                    <span className="text-sm">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protected Feature Example */}
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades Avançadas</CardTitle>
                <CardDescription>
                  Recursos disponíveis apenas para usuários autenticados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      🎯 Análise de Concorrentes
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Acesse dados detalhados de anúncios da concorrência
                    </p>
                    <Button size="sm" className="w-full">
                      Acessar Análises
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      📊 Relatórios Personalizados
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Gere relatórios customizados baseados nos seus interesses
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Criar Relatório
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      🔔 Alertas Inteligentes
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure alertas para novos anúncios dos concorrentes
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Configurar Alertas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Técnicas</CardTitle>
                <CardDescription>
                  Detalhes sobre a implementação da autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    ✅ <strong>Clerk Provider:</strong> Configurado no layout
                    raiz
                  </p>
                  <p>
                    ✅ <strong>Middleware:</strong> Protegendo rotas
                    automaticamente
                  </p>
                  <p>
                    ✅ <strong>Server-side Auth:</strong> Verificação segura no
                    servidor
                  </p>
                  <p>
                    ✅ <strong>UI Components:</strong> Componentes
                    pré-construídos do Clerk
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
