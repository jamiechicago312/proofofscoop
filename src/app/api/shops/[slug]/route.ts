import { NextResponse } from "next/server";
import { getShop } from "@/lib/catalog";
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) { const shop = await getShop((await params).slug); return shop ? NextResponse.json({ shop }) : NextResponse.json({ error: "Not found." }, { status: 404 }); }
