import { AccountPanel } from "@/components/account-panel";
import Link from "next/link";

export default function AccountPage() {
  return (
    <main className="account-page">
      <nav className="nav">
        <Link className="wordmark" href="/">Proof of Scoop</Link>
      </nav>
      <AccountPanel />
    </main>
  );
}
