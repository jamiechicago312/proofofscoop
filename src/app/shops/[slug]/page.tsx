import Link from "next/link";
import { notFound } from "next/navigation";
import { getShop, getShopReviews } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const shop = await getShop((await params).slug); if (!shop) notFound(); const reviews = await getShopReviews(shop.id);
  return <main><nav className="nav"><Link className="wordmark" href="/">Proof of Scoop</Link><Link className="nav-link" href="/shops">Directory</Link></nav><section className="directory"><p className="eyebrow">{shop.city}, {shop.country}</p><h1>{shop.name}</h1><p className="lede">{shop.description}</p><p>{shop.address}</p><Link className="button button-primary" href="/account">Sign in to write a review</Link><h2 className="review-heading">Reviews</h2>{reviews.length ? <div className="review-list">{reviews.map((review) => <article className="review" key={review.id}><strong>{"★".repeat(review.rating)}<span className="sr-only">{review.rating} out of 5</span></strong><p>{review.body}</p><small>{review.displayName ?? "Verified scooper"}</small></article>)}</div> : <p className="empty-state">No reviews yet. Be the first verified scooper to share one.</p>}</section></main>;
}
