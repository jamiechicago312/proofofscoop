import { NextResponse } from "next/server";
import { listShops } from "@/lib/catalog";
export async function GET() { try { return NextResponse.json({ shops: await listShops() }); } catch { return NextResponse.json({ error: "Directory unavailable." }, { status: 503 }); } }
