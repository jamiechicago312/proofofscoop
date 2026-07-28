"use client";
export default function ShopsError({ reset }: { reset: () => void }) { return <main className="directory" role="alert"><h1>Directory temporarily unavailable.</h1><p>Please try again shortly.</p><button className="button button-primary" onClick={reset}>Try again</button></main>; }
