
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/firebase/client-provider';
import { 
    createUserWithEmailAndPassword, 
    updateProfile, 
    GoogleAuthProvider, 
    signInWithPopup,
    fetchSignInMethodsForEmail 
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useLanguage } from '@/providers/language-provider';
import { ensureUserDoc } from '@/lib/ensureUserDoc';

const signupSchema = z.object({
    name: z.string().min(1, "Nama lengkap diperlukan"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

export default function SignUpPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setErrors({ form: "Layanan autentikasi tidak tersedia." });
      return;
    }

    const validation = signupSchema.safeParse({ name, email, password, confirmPassword });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        throw { code: 'auth/email-already-in-use' };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: name,
        photoURL: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
      });

      // Create the user document in our own DB via server action
      await ensureUserDoc(firebaseUser);
      
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Selamat datang di KreaTask!",
      });

      router.push('/dashboard');

    } catch (firebaseError: any) {
      let errorMessage = "Gagal mendaftar. Silakan coba lagi.";
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah digunakan oleh akun lain.';
      }
      setErrors({ form: errorMessage });
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    if (!auth) return;
    
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        
        // This will create a user doc in our DB if it doesn't exist.
        await ensureUserDoc(user);

        toast({
            title: t('signup.google_success_title'),
            description: t('signup.google_success_desc', { name: user.displayName || 'User' }),
        });
        
        router.push('/dashboard');
      })
      .catch((error: any) => {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          console.error("Google sign-up error:", error);
          let description = "Terjadi kesalahan saat mendaftar dengan Google.";
           if (error.code === 'auth/popup-blocked') {
            description = "Browser Anda memblokir popup login. Harap izinkan popup untuk situs ini dan coba lagi.";
          }
          toast({
              variant: "destructive",
              title: "Pendaftaran Google Gagal",
              description: description,
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
             <form onSubmit={handleSignUp}>
                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-center bg-secondary/80 rounded-full p-1 max-w-fit mx-auto">
                         <Button variant="secondary" asChild className="rounded-full px-6 bg-primary text-primary-foreground shadow-md">
                            <Link href="/signup">{t('signup.signup_button')}</Link>
                        </Button>
                        <Button variant="ghost" asChild className="rounded-full px-6 text-muted-foreground">
                            <Link href="/signin">{t('signup.signin_button')}</Link>
                        </Button>
                    </div>

                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold font-headline">{t('signup.title')}</h1>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="text"
                            placeholder={t('signup.name_placeholder')}
                            className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type="email"
                            placeholder={t('signup.email_placeholder')}
                            className="pl-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t('signup.password_placeholder')}
                            className="pl-10 pr-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                        </div>
                         <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={t('signup.confirm_password_placeholder')}
                            className="pl-10 pr-10 h-12 bg-background/30 border-white/10 placeholder:text-muted-foreground"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading || isGoogleLoading}
                            />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </Button>
                            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
                        </div>

                         {errors.form && <p className="text-sm text-center text-destructive">{errors.form}</p>}
                        
                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-base"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : t('signup.submit_button')}
                        </Button>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            {t('signup.separator')}
                            </span>
                        </div>
                    </div>
                    
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 bg-background/50 border-white/20 hover:bg-background/80"
                        onClick={handleGoogleSignUp}
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Image src="/google.svg" width={24} height={24} alt="Google logo" className="mr-2" />
                    )}
                    {t('signup.google_button')}
                </Button>
                    <p className="text-center text-xs text-muted-foreground !mt-8">
                        {t('signup.terms')}
                    </p>
                </div>
            </form>
        </div>
    </div>
  );
}
