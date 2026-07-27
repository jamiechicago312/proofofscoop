import { AuthControl } from "@/components/auth-control";
import Link from "next/link";
const layers = [
  ["Orange sherbet", "Bright, citrusy optimism", "orange"],
  ["Pistachio", "A little local color", "pistachio"],
  ["Palmer House", "Warm, welcoming cream", "palmer-house"],
  ["Strawberry", "Reviews worth sharing", "strawberry"],
  ["Chocolate", "The proof beneath it all", "chocolate"],
] as const;

export default function Home() {
  return (
    <main>
      <nav aria-label="Primary navigation" className="nav">
        <a className="wordmark" href="#top">Proof of Scoop</a>
        <span className="nav-actions"><a className="nav-link" href="#how-it-works">How it works</a><AuthControl /></span>
      </nav>

      <section className="hero" id="top">
        <p className="eyebrow">Chicago ice cream, honestly reviewed</p>
        <h1>Find your next great scoop.</h1>
        <p className="lede">
          Browse neighborhood favorites. When you are ready to contribute, verify once and add your own review.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/shops">Explore shops</Link>
          <a className="button button-secondary" href="https://github.com/jamiechicago312/proofofscoop">View on GitHub</a>
        </div>
      </section>

      <section className="layers" aria-labelledby="layers-title">
        <div>
          <p className="eyebrow">The Rainbow Cone palette</p>
          <h2 id="layers-title">Five classic layers. One warm neighborhood guide.</h2>
        </div>
        <ol className="layer-list">
          {layers.map(([name, description, token]) => (
            <li className={`layer layer-${token}`} key={name}>
              <span>{name}</span>
              <small>{description}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="how-it-works" id="how-it-works" aria-labelledby="how-title">
        <p className="eyebrow">Coming next</p>
        <h2 id="how-title">A normal review app with a small proof behind it.</h2>
        <div className="steps">
          <article><span>01</span><h3>Browse</h3><p>Read shop and review details without creating an account.</p></article>
          <article><span>02</span><h3>Verify once</h3><p>Sign in and complete a clearly labeled verification flow.</p></article>
          <article><span>03</span><h3>Share a scoop</h3><p>Verified contributors can leave an honest review.</p></article>
        </div>
      </section>

      <footer>Built for a small, honest POC. No rewards, no hype.</footer>
    </main>
  );
}
