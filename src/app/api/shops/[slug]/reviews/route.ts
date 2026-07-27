import { NextResponse } from "next/server";
import { getShop, getShopReviews } from "@/lib/catalog";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const shop = await getShop((await params).slug); if (!shop) return NextResponse.json({ error: "Not found." }, { status: 404 }); return NextResponse.json({ reviews: await getShopReviews(shop.id) }); }
