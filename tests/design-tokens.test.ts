import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync("src/app/globals.css", "utf8");

describe("Rainbow Cone design tokens", () => {
  it("keeps the approved color palette available to the UI", () => {
    expect(stylesheet).toContain("--rc-orange-sherbet: #ff7a18");
    expect(stylesheet).toContain("--rc-pistachio: #92c582");
    expect(stylesheet).toContain("--rc-palmer-house: #f7e1d7");
    expect(stylesheet).toContain("--rc-strawberry: #ee5282");
    expect(stylesheet).toContain("--rc-chocolate: #3d2314");
    expect(stylesheet).toContain("--rc-waffle-cone: #dda15e");
    expect(stylesheet).toContain("--rc-brand-pink: #e55b86");
  });
});
