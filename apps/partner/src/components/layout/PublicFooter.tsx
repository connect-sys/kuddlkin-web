import React from 'react';
import { useNavigate } from 'react-router-dom';
import kuddlLogoFull from '../../assets/images/kuddl-logo-full.svg';

const PublicFooter: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer style={{ backgroundColor: '#578F82' }} className="text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4 bg-white px-4 py-2.5 rounded-xl inline-block shadow-sm">
              <img
                src={kuddlLogoFull}
                alt="Kuddl"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-white/80 mb-4">India's fastest growing service marketplace for trusted, high quality childcare.</p>
            <p className="text-white/70 text-sm leading-relaxed">
              TENDERNEST PRIVATE LIMITED<br />
              400-A, 4th Floor, 12 Ajit Singh House,<br />
              Yusuf Sarai, Green Park,<br />
              New Delhi – 110016
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-white/80">
              <li><button onClick={() => handleNavigate('/help')} className="hover:text-white transition">Help Center</button></li>
              <li><button onClick={() => handleNavigate('/contact')} className="hover:text-white transition">Contact Us</button></li>
              <li><button onClick={() => handleNavigate('/trust-safety')} className="hover:text-white transition">Trust &amp; Safety</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-white/80">
              <li><button onClick={() => handleNavigate('/about')} className="hover:text-white transition">About Us</button></li>
              <li><button onClick={() => handleNavigate('/careers')} className="hover:text-white transition">Careers</button></li>
              <li><button onClick={() => handleNavigate('/press')} className="hover:text-white transition">Press</button></li>
              <li><button onClick={() => handleNavigate('/blog')} className="hover:text-white transition">Blog</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
          <p>&copy; {new Date().getFullYear()} Kuddl. All rights reserved. Made with love for childcare service providers across India.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
