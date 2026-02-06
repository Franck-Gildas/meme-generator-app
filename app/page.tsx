import MemeFeed from "@/components/MemeFeed";

export default function HomePage() {
  return (
    <div>
      <header className="page-header">
        <h1>Meme Generator</h1>
        <span className="feed-sort-label">Sorted by newest</span>
      </header>
      <MemeFeed />
    </div>
  );
}
