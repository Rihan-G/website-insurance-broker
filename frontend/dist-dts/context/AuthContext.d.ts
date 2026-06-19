import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "../types";
interface SignInResult {
    error: Error | null;
    profile: Profile | null;
}
interface AuthState {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    /** True when using in-browser demo users (no Supabase session). */
    demoAuthActive: boolean;
    signIn: (email: string, password: string) => Promise<SignInResult>;
    signUp: (email: string, password: string, fullName: string) => Promise<{
        error: Error | null;
    }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    demoAuthAvailable: boolean;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthState;
export {};
