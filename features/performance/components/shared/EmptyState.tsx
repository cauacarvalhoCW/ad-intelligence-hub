import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { FileQuestion, Filter, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "no-data" | "no-results" | "filter";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title = "Nenhum dado encontrado",
  description = "Não há dados disponíveis para os filtros selecionados. Tente ajustar os filtros ou selecionar um período diferente.",
  icon = "no-data",
  action,
  className,
}: EmptyStateProps) {
  const IconComponent = {
    "no-data": FileQuestion,
    "no-results": Filter,
    filter: Filter,
  }[icon];

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <IconComponent className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


