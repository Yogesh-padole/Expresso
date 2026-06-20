import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";
const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <span className="font-serif text-xl text-primary">Expresso</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Explore
          </Link>
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Write
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
