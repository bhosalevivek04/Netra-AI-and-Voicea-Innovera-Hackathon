import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher'; // Adjust the path

function Header() {
  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-purple-600">
            Perceiva
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/forums">Forums</Link>
            <Link href="/login">Sign In</Link>
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
            </Link>
            <LanguageSwitcher /> {/* Add the LanguageSwitcher here */}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;