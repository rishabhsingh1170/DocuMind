// Reusable Card Component (used across all pages)
export default function Card({ children }) {
  return (
    <div className="group rounded-2xl bg-white/60 backdrop-blur-md 
    border border-white/30 p-5 shadow-md
    hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {children}
    </div>
  );
}