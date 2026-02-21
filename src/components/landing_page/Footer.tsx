export function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-black text-center text-gray-500 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <span className="font-bold text-gray-200">Oi! Lend Me</span>
           <span className="mx-2">© 2026</span>
        </div>
        
        <div className="flex gap-6">
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
           <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
