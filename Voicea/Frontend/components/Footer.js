import LanguageSwitcher from './LanguageSwitcher'; // Adjust the path

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p>© 2023 Perceiva. All rights reserved.</p>
          <LanguageSwitcher /> {/* Add the LanguageSwitcher here */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;