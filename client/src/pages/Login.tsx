import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { KeyRound } from 'lucide-react';

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Digite seu e-mail primeiro');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setMode('login');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        await handleResetPassword();
        return;
      }
      if (mode === 'signup') {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        if (signUpData.session) {
          await utils.auth.me.invalidate();
          toast.success('Conta criada com sucesso!');
          setLocation('/');
          return;
        }
        toast.success('Conta criada! Clique agora para entrar.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await utils.auth.me.invalidate();
        setLocation('/');
      }
    } catch (error: any) {
      const msg = error?.message || 'Erro ao processar';
      if (msg.includes('Invalid login')) {
        toast.error('E-mail ou senha incorretos');
      } else if (msg.includes('already registered')) {
        toast.error('E-mail já cadastrado. Faça login.');
        setMode('login');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <img src="/logo-fisio.png" alt="FisioPrecifica" className="h-16 mx-auto" />
          <h1 className="text-2xl font-heading font-bold text-foreground">
            FisioPrecifica
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Acesse sua calculadora de preços'
              : mode === 'signup'
                ? 'Crie sua conta gratuita'
                : 'Recupere o acesso à sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className="rounded-xl"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="rounded-xl"
            />
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Senha</Label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="rounded-xl"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading
              ? 'Aguarde...'
              : mode === 'login'
                ? 'Entrar'
                : mode === 'signup'
                  ? 'Criar conta'
                  : 'Enviar e-mail de recuperação'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              {mode === 'reset' ? 'Lembrou a senha?' : 'Já tem conta?'}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
