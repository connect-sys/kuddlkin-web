import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import kuddlLogoFull from '../../assets/images/kuddl-logo-full.svg';

const PublicHeader: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8" style={{ zIndex: 999 }}>
      <div className="bg-white rounded-full px-8 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.1)] max-w-6xl mx-auto flex items-center justify-between">
        <button onClick={() => { navigate('/'); window.scrollTo(0, 0); }} className="cursor-pointer">
          <img src={kuddlLogoFull} alt="Kuddl" className="h-8 w-auto" />
        </button>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => scrollToSection('services')} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Services</button>
          <button onClick={() => scrollToSection('features')} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Features</button>
          <button onClick={() => navigate('/pricing')} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Pricing</button>
          <button onClick={() => navigate('/about')} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">About us</button>
          <button onClick={() => navigate('/contact')} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Contact us</button>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate('/login')} className="font-bold text-[#CF956D] text-[15px] transition-colors">
            Login
          </button>
          <button onClick={() => navigate('/mobile-verification')} className="bg-[#578f82] text-white px-8 py-2.5 rounded-full font-medium text-[15px] hover:opacity-90 shadow-md">
            Join as Partner
          </button>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu Button - visible on mobile */}
        <button 
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection('services'); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Services</button>
          <button onClick={() => { setMobileMenuOpen(false); scrollToSection('features'); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Features</button>
          <button onClick={() => { setMobileMenuOpen(false); navigate('/pricing'); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Pricing</button>
          <button onClick={() => { setMobileMenuOpen(false); navigate('/about'); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">About us</button>
          <button onClick={() => { setMobileMenuOpen(false); navigate('/contact'); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Contact us</button>
          <button onClick={() => navigate('/login')} className="block w-full text-left py-3 font-bold text-[#CF956D]">
            Login
          </button>
          <button onClick={() => navigate('/mobile-verification')} className="block w-full mt-2 text-center text-white py-3 rounded-xl font-medium bg-[#578f82]">
            Join as Partner
          </button>
        </div>
      )}
    </nav>
  );
};

export default PublicHeader;
