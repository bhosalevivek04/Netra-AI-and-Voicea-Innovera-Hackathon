import LanguageSwitcher from './LanguageSwitcher'; // Adjust the path

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>
      <div className="mt-4">
        <LanguageSwitcher /> {/* Add the LanguageSwitcher here */}
      </div>
    </aside>
  );
}

export default Sidebar;