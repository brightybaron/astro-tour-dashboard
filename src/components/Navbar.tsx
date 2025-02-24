import React, { useState, useEffect } from "react";

const Navbar = ({ bgNav }: { bgNav: any }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  type MenuItem = {
    page: string;
    path: string;
    icon: any;
  };

  const listMenu: MenuItem[] = [
    {
      page: "Home",
      path: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
    {
      page: "Trip",
      path: "/trip",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </svg>
      ),
    },
    {
      page: "About",
      path: "/about",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M15 18a3 3 0 1 0-6 0" />
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
          <circle cx="12" cy="13" r="2" />
        </svg>
      ),
    },
    {
      page: "FAQ",
      path: "/faq",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "sm:bg-deep-blue bg-white shadow-md"
          : isMenuOpen
          ? "bg-white"
          : `${bgNav ? "bg-transparent" : "bg-deep-blue"} sm:pt-6 pt-0`
      }`}
    >
      <div className="max-w-7xl mx-auto sm:px-12 px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex-shrink-0 flex items-center gap-x-2">
            <img
              src="/logo.png"
              alt="logo-icon"
              loading="lazy"
              height={32}
              width={32}
              className={`h-12 w-12 rounded-full p-0.5 transition-all duration-300  ${
                isScrolled ? "sm:bg-white" : ""
              }`}
            />
            <span
              className={`text-2xl font-bold hover:text-soft-turquoise hover:cursor-pointer after:content-[''] after:block after:border-b-2 after:transition-all after:duration-300 after:scale-x-0 after:origin-center hover:after:scale-x-100 ${
                isScrolled
                  ? "sm:text-white text-deep-blue"
                  : isMenuOpen
                  ? "text-deep-blue"
                  : "text-white"
              }`}
            >
              Badak Gunung
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4 uppercase">
              {listMenu.map((item, index) => (
                <a
                  key={index}
                  href={item.path}
                  className="px-3 py-2 rounded-md font-semibold text-white hover:text-soft-turquoise after:content-[''] after:block after:border-b-2 after:transition-all after:duration-300 after:scale-x-0 after:origin-center hover:after:scale-x-100 inline-flex items-center gap-x-1"
                >
                  <span>{item.icon}</span>
                  {item.page}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isScrolled
                  ? "text-deep-blue"
                  : isMenuOpen
                  ? "text-deep-blue"
                  : "text-white"
              }`}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              {listMenu.map((item, index) => (
                <a
                  key={index}
                  href={item.path}
                  className="px-3 py-2 rounded-md text-base font-semibold text-deep-blue uppercase inline-flex items-center gap-x-1"
                >
                  <span>{item.icon}</span>
                  {item.page}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
