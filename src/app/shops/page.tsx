import Link from "next/link";
import { listShops } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopsPage() {
  const shops = await listShops();
  return <main><nav className="nav"><Link className="wordmark" href="/">Proof of Scoop</Link></nav><section className="directory"><p className="eyebrow">Chicago directory</p><h1>Find your next great scoop.</h1>{shops.length ? <div className="shop-grid">{shops.map((shop) => <Link className="shop-card" href={`/shops/${shop.slug}`} key={shop.id}><h2>{shop.name}</h2><p>{shop.description}</p><small>{shop.address}, {shop.city}</small></Link>)}</div> : <p className="empty-state">The directory is being scooped into shape. Check back soon.</p>}</section></main>;
}
