import { randomUUID } from "node:crypto";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed the database.");
const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const shops = [
  ["Original Rainbow Cone", "original-rainbow-cone", "1571 W 95th St", "The classic Chicago five-flavor slice."],
  ["Margie's Candies", "margies-candies", "1960 N Western Ave", "Old-school ice cream and candy counter."],
  ["Jeni's Splendid Ice Creams", "jenis-splendid-ice-creams-wicker-park", "1505 N Milwaukee Ave", "Creative seasonal scoops in Wicker Park."],
  ["The Original Dairy Bar", "the-original-dairy-bar", "3124 W Diversey Ave", "Neighborhood soft serve and sundaes."],
  ["Shawn Michelle's Homemade Ice Cream", "shawn-michelles-homemade-ice-cream", "46 E 47th St", "South Side institution for generous homemade scoops."],
  ["Pretty Cool Ice Cream", "pretty-cool-ice-cream", "2353 N California Ave", "Small-batch ice cream bars and treats."],
];
for (const [name, slug, address, description] of shops) {
  await sql`INSERT INTO shops (id, name, slug, city, country, address, description)
    VALUES (${randomUUID()}, ${name}, ${slug}, 'Chicago', 'United States', ${address}, ${description})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, description = EXCLUDED.description, updated_at = now()`;
}
await sql.end();
console.log(`Seeded ${shops.length} Chicago ice-cream shops.`);
