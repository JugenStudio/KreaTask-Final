
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/hooks/use-auth-actions-server';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/providers/language-provider';
import { ensureUserDoc } from '@/lib/ensureUserDoc';

export default function SignInPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Layanan autentikasi tidak tersedia.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      router.push('/dashboard');
    } catch (firebaseError: any) {
      let errorMessage = "Terjadi kesalahan saat login. Silakan coba lagi.";
      switch (firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Email atau password yang Anda masukkan salah.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid.';
          break;
        default:
          console.error("Firebase sign-in error:", firebaseError);
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!auth || !firestore) return;
    
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await ensureUserDoc(firestore, user);
        
        toast({
          title: t('signin.google_success_title'),
          description: t('signin.google_success_desc', { name: user.displayName || 'User' }),
        });
        router.push('/dashboard');
      })
      .catch((error: any) => {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
          console.log("Proses login Google dibatalkan oleh pengguna.");
        } else if (error.code === 'auth/popup-blocked') {
          toast({
            variant: "destructive",
            title: "Popup Diblokir",
            description: "Browser Anda memblokir popup login. Harap izinkan popup untuk situs ini dan coba lagi.",
          });
        } else {
            console.error("Google sign-in error:", error);
            toast({
                variant: "destructive",
                title: "Login Google Gagal",
                description: "Terjadi kesalahan saat login dengan Google.",
            });
        }
      })
      .finally(() => {
        setIsGoogleLoading(false);
      });
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className={cn("w-full rounded-2xl bg-card/60 backdrop-blur-lg shadow-2xl border border-white/10 overflow-hidden")}>
         <form onSubmit={handleSignIn}>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
                    <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                        <Link href="/signup">{t('signin.signup_button')}</Link>
                    </Button>
                    <Button variant="secondary" asChild className="rounded-full px-6 bg-primary text-primary-foreground shadow-md">
                        <Link href="/signin">{t('signin.signin_button')}</Link>
                    </Button>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold font-headline">{t('signin.title')}</h1>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                        type="email"
                        placeholder={t('signin.email_placeholder')}
                        className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading || isGoogleLoading}
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t('signin.password_placeholder')}
                        className="pl-10 pr-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading || isGoogleLoading}
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                           {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    
                    {error && <p className="text-sm text-center text-destructive">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-base"
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('signin.submit_button')}
                    </Button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        {t('signin.separator')}
                        </span>
                    </div>
                </div>
            </div>
        </form>

        <form onSubmit={(e) => { e.preventDefault(); handleGoogleSignIn(); }} className="p-8 pt-0">
            <Button
                type="submit"
                variant="outline"
                className="w-full h-12 bg-background/50 border-white/20 hover:bg-background/80"
                disabled={isLoading || isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Image src="/google.svg" width={24} height={24} alt="Google logo" className="mr-2" />
                )}
                {t('signin.google_button')}
            </Button>
        </form>
      </div>
    </div>
  );
}

    