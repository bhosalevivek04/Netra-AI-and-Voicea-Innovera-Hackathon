import LanguageSwitcher from './LanguageSwitcher'; // Adjust the path

function FloatingLanguageSwitcher() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <LanguageSwitcher />
    </div>
  );
}

export default FloatingLanguageSwitcher;