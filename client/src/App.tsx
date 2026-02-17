import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import Layout from "./components/Layout";
import LeadGate from "./components/LeadGate";
import Home from "./pages/Home";
import Custos from "./pages/Custos";
import Precificacao from "./pages/Precificacao";
import Servicos from "./pages/Servicos";
import Simulacao from "./pages/Simulacao";
import Indicadores from "./pages/Indicadores";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Perfil from "./pages/Perfil";
import Leads from "./pages/Leads";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/custos" component={Custos} />
        <Route path="/precificacao" component={Precificacao} />
        <Route path="/servicos" component={Servicos} />
        <Route path="/simulacao" component={Simulacao} />
        <Route path="/indicadores" component={Indicadores} />
        <Route path="/relatorios" component={Relatorios} />
        <Route path="/configuracoes" component={Configuracoes} />
        <Route path="/perfil" component={Perfil} />
        <Route path="/admin/leads" component={Leads} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
      <LeadGate />
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <DataProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
