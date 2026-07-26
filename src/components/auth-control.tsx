"use client";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isPrivyConfigured } from "./providers";
export function AuthControl() { return isPrivyConfigured ? <Configured /> : <span className="setup-note">Add your Privy app ID to enable sign-in.</span>; }
function Configured() { const router = useRouter(); const { authenticated, logout } = usePrivy(); const { login } = useLogin({ onComplete: () => router.push("/account") }); return authenticated ? <span className="auth-actions"><Link href="/account">Account</Link><button className="text-button" onClick={() => logout()}>Sign out</button></span> : <button className="nav-button" onClick={login}>Sign in</button>; }
