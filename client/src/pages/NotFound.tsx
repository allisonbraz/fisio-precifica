import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-lg mx-4 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-heading font-bold text-foreground">404</h1>
          <h2 className="text-xl font-heading font-semibold text-foreground">
            Página não encontrada
          </h2>
        </div>

        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          A página que você está procurando não existe ou foi movida.
        </p>

        <Button onClick={handleGoHome} className="rounded-xl px-6">
          <Home className="w-4 h-4 mr-2" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
