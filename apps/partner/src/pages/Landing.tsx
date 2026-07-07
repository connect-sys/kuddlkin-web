import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PartyPopper, Sparkles, Heart, Search, TrendingUp, Shield, CheckCircle, MessageCircle, Bell, Users, Star, Clock, Award, ChevronDown, ChevronUp, Calendar, IndianRupee, Zap, Target, ArrowRight, Menu, X, Globe, UserCheck, CalendarCheck, Baby, GraduationCap, Package, Smartphone as Phone, ChevronLeft, ChevronRight, MapPin, Mail, Facebook, Twitter, Instagram, Linkedin, PhoneCall, Home, Scissors, Moon, Activity, User, BarChart3, Plus, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serviceTypeRegistry, categoryColors, ServiceType } from '../config/serviceTypeRegistry';
import toast from 'react-hot-toast';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import kuddlLogoFull from '../assets/images/kuddl-logo-full.svg';
import kuddlIcon from '../assets/images/kuddl_u.svg';
import backgroundHero from '../assets/images/background-hero.png';
import blankMobile from '../assets/images/mobile-app.svg';
import growWithBg from '../assets/images/grow_with.svg';
import belowKuddl from '../assets/images/below_kuddl.svg';
import rewardImg from '../assets/images/reward.svg';
import whyChooseBg from '../assets/images/why_choose_bg_shape.svg';
import arrowImg from '../assets/images/arrow.svg';
import leftSideShapes from '../assets/images/ic_left_side-shapes.svg';
import rightShapes from '../assets/images/ic_right_shapes.svg';
import topLeftArt from '../assets/images/top-left-art.svg';
import adventureIcon from '../assets/images/adventure.svg';
import bloomIcon from '../assets/images/bloom.svg';
import careIcon from '../assets/images/care.svg';
import heroVideo from '../assets/videos/hero.mp4';
import heroVideoM from '../assets/videos/hero_m.mp4';
import { getCategories, ServiceCategory } from '../api/categories';
import { getPublicStats, PlatformStats } from '../api/publicStats';
import ContactModal from '../components/ContactModal';

const Landing = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentServiceSlide, setCurrentServiceSlide] = useState(0);
  const [expandedMobileCard, setExpandedMobileCard] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  // Embla carousels
  const [servicesRef, servicesApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);
  const [benefitsRef, benefitsApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);
  const [desktopTestimonialsRef, desktopTestimonialsApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [mobileTestimonialsRef, mobileTestimonialsApi] = useEmblaCarousel({ loop: false, align: 'start' });
  const [canScrollTestimonialsPrev, setCanScrollTestimonialsPrev] = useState(false);
  const [canScrollTestimonialsNext, setCanScrollTestimonialsNext] = useState(false);
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = useState(0);
  const [pricingRef, pricingApi] = useEmblaCarousel({ loop: false, align: 'start' });

  useEffect(() => {
    if (desktopTestimonialsApi) {
      const onSelect = () => {
        setCanScrollTestimonialsPrev(desktopTestimonialsApi.canScrollPrev());
        setCanScrollTestimonialsNext(desktopTestimonialsApi.canScrollNext());
      };
      desktopTestimonialsApi.on('select', onSelect);
      desktopTestimonialsApi.on('reInit', onSelect);
      onSelect();
    }
  }, [desktopTestimonialsApi]);

  useEffect(() => {
    if (mobileTestimonialsApi) {
      const onSelectMobile = () => {
        setCurrentTestimonialSlide(mobileTestimonialsApi.selectedScrollSnap());
      };
      mobileTestimonialsApi.on('select', onSelectMobile);
      mobileTestimonialsApi.on('reInit', onSelectMobile);
      onSelectMobile();
    }
  }, [mobileTestimonialsApi]);

  useEffect(() => {
    if (servicesApi) {
      servicesApi.on('select', () => {
        setCurrentServiceSlide(servicesApi.selectedScrollSnap());
      });
    }
  }, [servicesApi]);


  // Category selection modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [otherServiceText, setOtherServiceText] = useState('');

  // Smart Category Picker state (kept for backwards-compat with chips below)
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);

  // Category-card picker: which category modal is open + per-category "Other" text.
  type CategoryKey = 'adventure' | 'bloom' | 'care' | 'discover';
  const [openCategoryKey, setOpenCategoryKey] = useState<CategoryKey | null>(null);
  const [otherTextByCategory, setOtherTextByCategory] = useState<Record<string, string>>({});
  const [otherEnabledByCategory, setOtherEnabledByCategory] = useState<Record<string, boolean>>({});

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  // Persist the selection to localStorage so MobileVerification can save it
  // server-side after OTP, and CompleteProfileModal step 2 can auto-tick the
  // same subcategories during profile completion.
  const handleConfirmSelection = () => {
    const hasOtherServices = Object.values(otherTextByCategory).some(text => text?.trim());
    if (selectedServices.length === 0 && !hasOtherServices) {
      toast.error('Please select at least one service');
      return;
    }

    const categories = Array.from(new Set(selectedServices.map(s => s.category)));
    const subcategories = selectedServices.map(s => s.label);
    const serviceTypeIds = selectedServices.map(s => s.id);

    // Append the user-typed "Other" entries as plain subcategory strings.
    const otherEntries = Object.entries(otherTextByCategory)
      .filter(([, v]) => (v || '').trim().length > 0)
      .map(([cat, v]) => `Other (${cat}): ${v.trim()}`);

    localStorage.setItem('kuddl_partner_categories', JSON.stringify(categories));
    localStorage.setItem('kuddl_partner_subcategories', JSON.stringify([...subcategories, ...otherEntries]));
    localStorage.setItem('kuddl_partner_service_types', JSON.stringify(serviceTypeIds));
    localStorage.setItem('kuddl_partner_other_by_category', JSON.stringify(otherTextByCategory));

    navigate('/mobile-verification');
  };

  // Category card metadata used by the new 4-card picker.
  const PICKER_CARDS: { key: CategoryKey; title: string; tagline: string; color: string; icon: JSX.Element }[] = [
    { key: 'adventure', title: 'Adventure', tagline: "Kids' parties, events & celebration experiences",  color: '#FB5261', icon: <img src={adventureIcon} alt="Adventure" className="w-9 h-9" /> },
    { key: 'bloom',     title: 'Bloom',     tagline: "Kids' learning, sports & developmental classes",   color: '#F59762', icon: <img src={bloomIcon} alt="Bloom" className="w-9 h-9" /> },
    { key: 'care',      title: 'Care',      tagline: 'Childcare, at-home services & wellbeing support', color: '#00B6AA', icon: <img src={careIcon} alt="Care" className="w-9 h-9" /> },
    { key: 'discover',  title: 'Discover',  tagline: "Workshops, camps & community experiences",          color: '#8B5CF6', icon: <Search className="w-9 h-9 text-white" /> },
  ];

  const countSelectedFor = (key: CategoryKey) =>
    selectedServices.filter(s => s.category === key).length +
    (otherTextByCategory[key]?.trim() ? 1 : 0);

  const subcategoriesFor = (key: CategoryKey) =>
    serviceTypeRegistry.filter(s => s.category === key);

  const toggleSubcategory = (item: ServiceType) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : [...prev, item]
    );
  };

  // Browse By Categories selection state
  const [selectedBrowseCategories, setSelectedBrowseCategories] = useState<string[]>([]);
  // Service portfolio - populated dynamically from API
const [servicePortfolio, setServicePortfolio] = useState<any[]>([]);
const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);

  // Ref for founding partner section
  const foundingPartnerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchPortfolioCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const allCategories = await getCategories();
        
        // Map icon and color based on category name - matching design
        const getCategoryMeta = (module: string, name: string) => {
          const iconClass = "w-12 h-12 md:w-14 md:h-14";
          
          // Check name first, then fallback to module
          const identifier = (name || module || '').toUpperCase();
          
          if (identifier.includes('ADVENTURE') || identifier.includes('EVENT')) {
            return { 
              icon: <img src={adventureIcon} alt="Adventure" className={iconClass} />, 
              color: "bg-[#FB5261]" 
            };
          } else if (identifier.includes('BLOOM')) {
            return { 
              icon: <img src={bloomIcon} alt="Bloom" className={iconClass} />, 
              color: "bg-[#F59762]" 
            };
          } else if (identifier.includes('CARE')) {
            return { 
              icon: <img src={careIcon} alt="Care" className={iconClass} />, 
              color: "bg-[#00B6AA]" 
            };
          } else if (identifier.includes('DISCOVER')) {
            return { 
              icon: <Search className={`${iconClass} text-white`} />, 
              color: "bg-[#8B5CF6]" 
            };
          } else {
            return { 
              icon: <Sparkles className={`${iconClass} text-white`} />, 
              color: "bg-[#578F82]" 
            };
          }
        };
        
        // Build portfolio dynamically from API response
        const portfolio = allCategories.map((cat: any, index: number) => {
          const subcategoryNames = cat.subcategories?.map((sub: any) => sub.name) || [];
          let displayServices: string[] = [];
          const otherService = subcategoryNames.find((name: string) => name === 'Other');
          const otherServices = subcategoryNames.filter((name: string) => name !== 'Other');
          displayServices = otherServices.slice(0, 9);
          if (otherService) displayServices.push(otherService);
          
          const meta = getCategoryMeta(cat.module, cat.name);
          
          return {
            id: cat.id || index + 1,
            title: cat.name || cat.title,
            subtitle: cat.description || "",
            description: cat.description || "",
            icon: meta.icon,
            color: meta.color,
            services: displayServices,
            module: cat.module,
            category_id: cat.id,
            subcategories: cat.subcategories || []
          };
        });
        
        setServicePortfolio(portfolio);
      } catch (error) {
        console.error('Failed to fetch categories for landing page:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchPortfolioCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const stats = await getPublicStats();
      setPlatformStats(stats);
    };
    fetchStats();
  }, []);

  // Handle hash navigation when landing on page from other routes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'pricing' && foundingPartnerRef.current) {
          foundingPartnerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: "Transform Your Childcare Career",
      subtitle: "Join India's Most Trusted Service Platform",
      description: "Connect with thousands of families seeking verified childcare professionals.",
      cta: "Start Your Journey",
      background: "from-[#578f82] to-[#4a7c70]",
      icon: <Baby className="w-16 h-16 text-white" />
    },
    {
      title: "Kuddl Care - Childcare Excellence",
      subtitle: "Professional Nanny & Caregiver Services",
      description: "From full-time nannies to postpartum support, emergency care to sleep consultants.",
      cta: "Explore Care Services",
      background: "from-[#cf956d] to-[#d4a574]",
      icon: <Heart className="w-16 h-16 text-white" />
    },
    {
      title: "Kuddl Bloom - Developmental Play",
      subtitle: "Early Learning & Child Development",
      description: "Lead structured play sessions that stimulate cognitive, emotional, and physical milestones.",
      cta: "Join Bloom Programme",
      background: "from-[#578f82] to-[#6aa091]",
      icon: <Sparkles className="w-16 h-16 text-white" />
    },
    {
      title: "Kuddl Events - Party Planning",
      subtitle: "Children's Events & Celebrations",
      description: "Create magical moments with end-to-end event planning.",
      cta: "Plan Events",
      background: "from-[#cf956d] to-[#d4a574]",
      icon: <PartyPopper className="w-16 h-16 text-white" />
    }
  ];

  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-[#cf956d]" />,
      title: "Reach the Right\nParents",
      desc: "Get discovered by verified families actively looking for trusted kids' services—without spending on marketing or outreach.",
      color: "from-[#cf956d] to-[#d4a574]"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#578f82]" />,
      title: "Grow your\nRevenue",
      desc: "Increase bookings and income through consistent visibility, structured discovery, and repeat clients on the platform.",
      color: "from-[#578f82] to-[#6aa091]"
    },
    {
      icon: <IndianRupee className="w-8 h-8 text-[#cf956d]" />,
      title: "Fast and Secure\nPayments",
      desc: "One-day payment settlement with transparent pricing and secure processes—so you get paid on time, every time.",
      color: "from-[#cf956d] to-[#d4a574]"
    },
    {
      icon: <Clock className="w-8 h-8 text-[#578f82]" />,
      title: "Easy\nOnboarding",
      desc: "Get started in just 10–15 minutes with a simple, guided onboarding process designed for non-tech users.",
      color: "from-[#578f82] to-[#6aa091]"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[#cf956d]" />,
      title: "All-in-One\nDashboard",
      desc: "Manage bookings, payments, availability, cancellations, and schedules—all from one place.",
      color: "from-[#cf956d] to-[#d4a574]"
    },
    {
      icon: <Target className="w-8 h-8 text-[#578f82]" />,
      title: "Built for the\nGig Economy",
      desc: "Kuddl brings structure, trust, and professionalism to kids' services—helping you grow without needing a physical setup.",
      color: "from-[#578f82] to-[#6aa091]"
    },
    {
      icon: <Star className="w-8 h-8 text-[#cf956d]" />,
      title: "Ratings, Reviews\n& Credibility",
      desc: "Build your reputation through verified reviews and ratings that reward quality work and consistency.",
      color: "from-[#cf956d] to-[#d4a574]"
    },
    {
      icon: <Zap className="w-8 h-8 text-[#578f82]" />,
      title: "Smart Tools That\nSupport You",
      desc: "Live bookings, calendar sync, instant notifications, and analytics that help you understand and grow your business.",
      color: "from-[#578f82] to-[#6aa091]"
    }
  ];

  const statistics = [
    { number: "15,000+", label: "Active Partners", color: "text-[#578f82]" },
    { number: "75,000+", label: "Happy Families", color: "text-[#cf956d]" },
    { number: "2M+", label: "Services Delivered", color: "text-[#578f82]" },
    { number: "4.9★", label: "Average Rating", color: "text-[#cf956d]" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Full-time nannies",
      image: "PS",
      text: "Kuddl transformed my childcare career. I now work with amazing families who truly value my services and earn 3x more than before.",
      rating: 5,
      location: "Mumbai",
      service: "Kuddl Care"
    },
    {
      name: "Rajesh Kumar",
      role: "Bloom Expert",
      image: "RK",
      text: "Leading developmental play sessions through Kuddl Bloom has been incredibly rewarding. I'm helping children reach their milestones while growing my expertise.",
      rating: 5,
      location: "Delhi",
      service: "Kuddl Bloom"
    },
    {
      name: "Anita Patel",
      role: "Event Planner",
      image: "AP",
      text: "Kuddl Events connected me with families looking for quality celebration planning. My business has grown beyond my expectations!",
      rating: 5,
      location: "Bangalore",
      service: "Kuddl Events"
    }
  ];

  const faqs = [
    {
      question: "Do I need to pay anything to join Kuddl?",
      answer: "Joining Kuddl is completely free for the first 30 days. During this period, there is no subscription fee and no commission."
    },
    {
      question: "How do I get started as a Kuddl partner?",
      answer: "Sign up, fill in your basic details, select the services you offer, and complete a quick verification. The entire onboarding process takes 10–15 minutes."
    },
    {
      question: "What services can I offer through Kuddl?",
      answer: "You can offer services across Kuddl's four verticals — Adventure, Bloom, Care, and Discover."
    },
    {
      question: "How do payments work?",
      answer: "Parents pay securely through the Kuddl platform. Payments are released after the service is completed, with settlement typically within one working day."
    },
    {
      question: "Can I work across multiple service categories?",
      answer: "Yes. If you are qualified to offer services across multiple categories, you can list them under one account and manage everything from a single dashboard."
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const nextServiceSlide = () => {
    setCurrentServiceSlide((prev) => (prev + 1) % servicePortfolio.length);
    setExpandedMobileCard(null);
  };
  const prevServiceSlide = () => {
    setCurrentServiceSlide((prev) => (prev - 1 + servicePortfolio.length) % servicePortfolio.length);
    setExpandedMobileCard(null);
  };

  const toggleMobileCard = (index: number) => setExpandedMobileCard(expandedMobileCard === index ? null : index);

  const getAnimationClass = (sectionId: string) => {
    return visibleSections.has(sectionId) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10';
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setSelectedSubcategories([]);
    setOtherServiceText('');
    setShowCategoryModal(true);
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategory)
        ? prev.filter(item => item !== subcategory)
        : [...prev, subcategory]
    );
  };

  const handleJoinAsPartner = () => {
    const customText = otherServiceText.trim();
    const allSubcategories = [
      ...selectedSubcategories,
      ...(customText ? [customText] : [])
    ];
    if (allSubcategories.length === 0) {
      alert('Please select at least one service or add your own interest');
      return;
    }
    const categoryData = {
      source: 'modal',
      mainCategory: {
        id: selectedCategory.id,
        title: selectedCategory.title,
        subtitle: selectedCategory.subtitle,
        description: selectedCategory.description,
        module: selectedCategory.module,
        color: selectedCategory.color
      },
      subcategories: allSubcategories,
      timestamp: Date.now()
    };
    localStorage.setItem('selectedCategories', JSON.stringify(categoryData));
    setShowCategoryModal(false);
    setTimeout(() => navigate('/mobile-verification'), 100);
  };

  const handleBrowseContinue = () => {
    if (selectedBrowseCategories.length === 0) return;
    // Build a map from service name → parent category title
    const parentCategories = [...new Set(
      selectedBrowseCategories
        .map(service => servicePortfolio.find(p => p.services.includes(service))?.title)
        .filter(Boolean)
    )] as string[];
    const categoryData = {
      source: 'browse',
      parentCategories,
      subcategories: selectedBrowseCategories,
      timestamp: Date.now()
    };
    localStorage.setItem('selectedCategories', JSON.stringify(categoryData));
    navigate('/mobile-verification');
  };

  const toggleBrowseCategory = (cat: string) => {
    setSelectedBrowseCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Dynamic icon mapping based on subcategory keywords - using actual category icons with colors
  const getBrowseIconWithColor = (subcategoryName: string): { icon: React.ReactNode; bgColor: string } => {
    const name = subcategoryName.toLowerCase();
    // Map to category icons based on keywords
    if (name.includes('party') || name.includes('event') || name.includes('birthday') || name.includes('entertainer') || name.includes('planner')) {
      return {
        icon: <img src={adventureIcon} alt="Adventure" className="w-6 h-6 md:w-7 md:h-7 opacity-90" />,
        bgColor: '#FB5261' // Darker pink/red tint for Adventure
      };
    }
    if (name.includes('class') || name.includes('workshop') || name.includes('learning') || name.includes('sport') || name.includes('music') || name.includes('dance') || name.includes('yoga') || name.includes('art') || name.includes('craft')) {
      return {
        icon: <img src={bloomIcon} alt="Bloom" className="w-6 h-6 md:w-7 md:h-7 opacity-90" />,
        bgColor: '#F59762' // Darker orange tint for Bloom
      };
    }
    if (name.includes('care') || name.includes('therapy') || name.includes('physio') || name.includes('nanny') || name.includes('baby') || name.includes('massage') || name.includes('speech') || name.includes('occupational') || name.includes('psycholog')) {
      return {
        icon: <img src={careIcon} alt="Care" className="w-6 h-6 md:w-7 md:h-7 opacity-90" />,
        bgColor: '#00B6AA' // Darker teal/cyan tint for Care
      };
    }
    // Default to bloom icon
    return {
      icon: <img src={bloomIcon} alt="Service" className="w-6 h-6 md:w-7 md:h-7 opacity-90" />,
      bgColor: '#8B5CF6'
    };
  };

  // Collect up to 12 subcategories spread across all modules dynamically from API
  const browseCategories = (() => {
    const all: string[] = [];
    servicePortfolio.forEach(portfolio => {
      if (portfolio.services && portfolio.services.length > 0) {
        // Take up to 3 subcategories from each category
        all.push(...portfolio.services.slice(0, 3));
      }
    });
    return all.slice(0, 12);
  })();

  // Generate stable random partner counts for each category (only once)
  const categoryPartnerCounts = useMemo(() => {
    const counts = [4, 6, 8, 12, 15, 18, 20, 25];
    return browseCategories.map(() => counts[Math.floor(Math.random() * counts.length)]);
  }, [browseCategories.length]);

  // Loading skeleton for categories
  const loadingSkeleton = Array(4).fill(null).map((_, i) => ({
    id: i,
    title: "Loading...",
    subtitle: "",
    description: "",
    icon: <Sparkles className="w-12 h-12" />,
    color: "bg-gray-200",
    services: [],
    module: "",
    isSkeleton: true
  }));

  // The old "great choice" confirmation screen has been removed — handleConfirmSelection
  // now navigates straight to /mobile-verification.

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'adineue PRO', sans-serif" }}>

      {/* ================================================ */}
      {/* SECTION 1: HERO                                  */}
      {/* ================================================ */}
      <section className="relative min-h-[100vh] overflow-hidden flex items-end md:items-center pt-24 pb-12 md:pb-0">

        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onClick={handleVideoClick}
          className="absolute top-0 left-0 w-full h-full object-contain md:object-cover z-0 cursor-pointer"
        >
          <source src={heroVideo} media="(min-width: 768px)" type="video/mp4" />
          <source src={heroVideoM} media="(max-width: 767px)" type="video/mp4" />
        </video>

        {/* Background Image Overlay */}
    

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_60%,rgba(0,0,0,0.95)_100%)] md:bg-[linear-gradient(to_right,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.5)_45%,rgba(255,255,255,0.7)_100%)] pointer-events-none" />


        {/* Navbar */}
        <nav className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8" style={{ zIndex: 999 }}>
          <div className="bg-white rounded-full px-8 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.1)] max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => { navigate('/'); window.scrollTo(0, 0); }} className="cursor-pointer">
              <img src={kuddlLogoFull} alt="Kuddl" className="h-8 w-auto" />
            </button>

            <div className="hidden md:flex items-center space-x-10">
              <button onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('services');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#services');
                }
              }} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Services</button>

              <button onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('features');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#features');
                }
              }} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Features</button>

              <button onClick={() => { navigate('/pricing'); window.scrollTo(0, 0); }} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Pricing</button>

              <button onClick={() => { navigate('/about'); window.scrollTo(0, 0); }} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">About us</button>

              <button onClick={() => { navigate('/contact'); window.scrollTo(0, 0); }} className="text-[#312B4C] hover:text-[#578f82] font-medium text-[15px] transition-colors cursor-pointer">Contact us</button>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate('/login')} className="font-bold text-[#CF956D] text-[15px] transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/mobile-verification')} className="bg-[#578f82] text-white px-8 py-2.5 rounded-full font-medium text-[15px] hover:opacity-90 shadow-md">
                Join as Partner
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg text-[#578f82]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-white rounded-2xl p-4 shadow-xl max-w-7xl mx-auto">
              <button onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  const element = document.getElementById('services');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#services');
                }
              }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Services</button>

              <button onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === '/') {
                  const element = document.getElementById('features');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#features');
                }
              }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Features</button>

              <button onClick={() => { setMobileMenuOpen(false); navigate('/pricing'); window.scrollTo(0, 0); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Pricing</button>

              <button onClick={() => { setMobileMenuOpen(false); navigate('/about'); window.scrollTo(0, 0); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">About us</button>

              <button onClick={() => { setMobileMenuOpen(false); navigate('/contact'); window.scrollTo(0, 0); }} className="block w-full text-left py-3 text-[#312B4C] border-b border-gray-100 font-medium">Contact us</button>

              <button onClick={() => navigate('/login')} className="block w-full text-left py-3 font-bold text-[#CF956D]">
                Login
              </button>
              <button onClick={() => navigate('/mobile-verification')} className="block w-full mt-2 text-center text-white py-3 rounded-xl font-medium bg-[#578f82]">
                Join as Partner
              </button>
            </div>
          )}
        </nav>

        {/* Hero Content */}
        <div className="relative !z-[4] max-w-7xl mx-auto px-4 md:px-8 w-full mt-auto md:mt-0 pb-8 md:pb-0">
          <div className="max-w-[700px] flex flex-col justify-end min-h-[40vh] md:min-h-0">
            <h1 className="text-[48px] md:text-[64px] font-[700] leading-[1.15] tracking-[1px] md:tracking-[1.62px] font-['adineue_PRO',_sans-serif]">
              <span className="text-[#CF956D] block">Earn More.</span>
              <span className="text-[#578F82] block md:inline md:whitespace-nowrap">Work Flexibly.</span>
              <span className="text-[#578F82] block md:inline md:whitespace-nowrap"> Be Trusted.</span>
            </h1>
            <p className="mt-4 md:mt-6 mb-8 md:mb-10 text-white text-[17px] md:text-[20px] max-w-[500px] font-['adineue_PRO',_sans-serif] font-normal leading-normal tracking-[0.48px]">
              Sign up as a Service Partner and get access to verified families, flexible schedules, and consistent earnings — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/mobile-verification')}
                className="flex items-center justify-center md:justify-start gap-3 px-8 py-3.5 rounded-full font-medium text-white transition-all hover:opacity-90 shadow-lg bg-[#578f82] w-full sm:w-fit"
              >
                Start Your Journey
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white" />
              </button>
              <button
                onClick={() => navigate('/become-partner')}
                className="flex items-center justify-center md:justify-start gap-3 px-8 py-3.5 rounded-full font-medium transition-all hover:bg-white/10 border border-white/40 text-white w-full sm:w-fit"
              >
                Become a Partner with Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 2: CHOOSE YOUR SERVICE CATEGORY           */}
      {/* ================================================ */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 style={{ color: '#578F82', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[32px] md:text-[42px] mb-4">
              What service do you provide?
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Pick a category to see the services in it. You can select services across multiple categories.
            </p>
          </div>

          {/* 4 category cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
            {PICKER_CARDS.map((card) => {
              const count = countSelectedFor(card.key);
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setOpenCategoryKey(card.key)}
                  className="group relative rounded-3xl p-6 md:p-7 text-center text-white shadow-lg overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 min-h-[260px] md:min-h-[280px] flex flex-col items-center justify-center"
                  style={{ backgroundColor: card.color }}
                >
                  {count > 0 && (
                    <span className="absolute top-3 right-3 bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      {count} selected
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur mb-4">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                    {card.title}
                  </h3>
                  <p className="text-white/85 text-[12px] md:text-[13px] leading-snug mb-4 line-clamp-3 px-1">
                    {card.tagline}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] font-semibold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full">
                    {count > 0 ? 'Edit selection' : 'Select services'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Service Chips (across all categories) */}
          {(selectedServices.length > 0 || Object.values(otherTextByCategory).some(text => text?.trim())) && (
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all animate-in zoom-in duration-200 shadow-sm"
                  style={{
                    borderColor: categoryColors[service.category],
                    backgroundColor: `${categoryColors[service.category]}08`,
                    color: categoryColors[service.category],
                  }}
                >
                  <span className="font-semibold text-sm">{service.label}</span>
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    className="p-0.5 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {/* Display custom "Other" services as chips */}
              {Object.entries(otherTextByCategory).map(([categoryKey, text]) => {
                if (!text?.trim()) return null;
                const color = categoryColors[categoryKey as CategoryKey];
                return (
                  <div
                    key={`other-${categoryKey}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all animate-in zoom-in duration-200 shadow-sm"
                    style={{
                      borderColor: color,
                      backgroundColor: `${color}08`,
                      color: color,
                    }}
                  >
                    <span className="font-semibold text-sm">{text.trim()}</span>
                    <button
                      onClick={() => {
                        setOtherTextByCategory((prev) => ({ ...prev, [categoryKey]: '' }));
                        setOtherEnabledByCategory((prev) => ({ ...prev, [categoryKey]: false }));
                      }}
                      className="p-0.5 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Continue Button — goes to /mobile-verification with selection persisted */}
          <div className="text-center">
            <button
              onClick={handleConfirmSelection}
              disabled={selectedServices.length === 0 && !Object.values(otherTextByCategory).some(text => text?.trim())}
              className={`
                group relative inline-flex items-center gap-4 px-10 md:px-12 py-4 md:py-5 rounded-full text-lg md:text-xl font-bold transition-all duration-300
                ${(selectedServices.length > 0 || Object.values(otherTextByCategory).some(text => text?.trim()))
                  ? 'bg-[#578F82] text-white shadow-xl hover:shadow-[#578F82]/30 hover:-translate-y-1'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              Continue
              <ArrowRight className={`h-6 w-6 transition-transform duration-300 ${(selectedServices.length > 0 || Object.values(otherTextByCategory).some(text => text?.trim())) ? 'group-hover:translate-x-1' : ''}`} />
            </button>
            <p className="mt-4 text-sm text-gray-500">
              {(selectedServices.length === 0 && !Object.values(otherTextByCategory).some(text => text?.trim()))
                ? 'Pick a category above to see services'
                : `${selectedServices.length + Object.values(otherTextByCategory).filter(text => text?.trim()).length} service${(selectedServices.length + Object.values(otherTextByCategory).filter(text => text?.trim()).length) > 1 ? 's' : ''} selected`}
            </p>
          </div>
        </div>

        {/* Sub-category modal — opens when a card is clicked */}
        {openCategoryKey && (() => {
          const cat = PICKER_CARDS.find((c) => c.key === openCategoryKey)!;
          const subs = subcategoriesFor(openCategoryKey);
          const otherText = otherTextByCategory[openCategoryKey] || '';
          const otherEnabled = otherEnabledByCategory[openCategoryKey] || false;
          return (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpenCategoryKey(null)}>
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-5 flex items-center justify-between text-white" style={{ backgroundColor: cat.color }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold leading-tight" style={{ fontFamily: '"adineue PRO", sans-serif' }}>{cat.title} services</h3>
                      <p className="text-white/85 text-xs md:text-sm">Select all that apply.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenCategoryKey(null)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {subs.map((s) => {
                      const checked = !!selectedServices.find((sel) => sel.id === s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                            checked ? 'border-[#578F82] bg-[#578F82]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSubcategory(s)}
                            className="w-4 h-4 accent-[#578F82] flex-shrink-0"
                          />
                          <span className={`text-sm font-medium ${checked ? 'text-[#578F82]' : 'text-gray-700'}`}>
                            {s.label}
                          </span>
                        </label>
                      );
                    })}

                    {/* Other — freeform input - now part of the grid */}
                    <label
                      htmlFor={`other-${openCategoryKey}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        otherEnabled ? 'border-[#578F82] bg-[#578F82]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        id={`other-${openCategoryKey}`}
                        type="checkbox"
                        checked={otherEnabled}
                        onChange={(e) => {
                          setOtherEnabledByCategory((prev) => ({ ...prev, [openCategoryKey]: e.target.checked }));
                          if (!e.target.checked) {
                            setOtherTextByCategory((prev) => ({ ...prev, [openCategoryKey]: '' }));
                          }
                        }}
                        className="w-4 h-4 accent-[#578F82] flex-shrink-0"
                      />
                      <span className={`text-sm font-medium ${otherEnabled ? 'text-[#578F82]' : 'text-gray-700'}`}>
                        Other — something not listed here
                      </span>
                    </label>
                  </div>

                  {/* Text input shown when Other is checked */}
                  {otherEnabled && (
                    <div className="mt-4">
                      <input
                        autoFocus
                        type="text"
                        value={otherText.trim() === '' ? '' : otherText}
                        onChange={(e) => setOtherTextByCategory((prev) => ({ ...prev, [openCategoryKey]: e.target.value }))}
                        placeholder={`Describe your ${cat.title.toLowerCase()} service`}
                        className="w-full px-4 py-2.5 bg-white rounded-lg border-2 border-[#578F82] focus:outline-none focus:ring-2 focus:ring-[#578F82] text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="px-5 md:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-500">
                    {countSelectedFor(openCategoryKey)} selected
                  </span>
                  <button
                    onClick={() => setOpenCategoryKey(null)}
                    className="px-6 py-2.5 rounded-full bg-[#578F82] hover:bg-[#4a7c70] text-white font-semibold text-sm shadow-md transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ================================================ */}
      {/* SECTION 2B: FEATURES (Why Choose Kuddl)          */}
      {/* ================================================ */}
      <section id="features" className="py-32 relative bg-[#FFF] overflow-hidden">
        {/* Background shape */}
        <div className="absolute inset-0 z-0 pointer-events-none w-full h-full flex justify-start items-center">
          <img src={whyChooseBg} alt="" className="w-full h-full object-cover md:object-fill object-left" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
            <div className="flex items-center gap-4">
              <h2 style={{ fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[32px] md:text-[42px]">
                <span className="text-[#312B4C]">Why Choose </span>
                <span className="text-[#578F82] relative inline-block">
                  Kuddl
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#CF956D]" />
                </span>
              </h2>
              <div className="w-12 h-12 rounded-2xl bg-[#CF956D] flex items-center justify-center text-white font-bold text-2xl shadow-md">
                <img src={kuddlIcon} alt="Kuddl" className="w-6 h-6 md:w-7 md:h-7" />
              </div>
            </div>
            <div className="max-w-md">
              <p className="text-gray-700 leading-relaxed text-sm">
                Kuddl makes childcare simple, reliable, and stress-free by connecting you with verified, trusted nannies and seamless booking tools—all in one easy-to-use platform.
              </p>
            </div>
          </div>

          {/* Benefits Slider (Embla) */}
          <div className="relative overflow-hidden pb-12 pt-4 -mx-4 px-4" ref={benefitsRef}>
            <div className="flex">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex-[0_0_auto] min-w-0 pl-8 pb-4">
                  <div
                    className="bg-white rounded-3xl p-8 w-[270px] border-2 border-[#578F82] h-full"
                    style={{ boxShadow: '8px 8px 0px #CF956D' }}
                  >
                    <div className="w-16 h-16 rounded-full bg-[#F5E6D3] flex items-center justify-center mb-8">
                      {benefit.icon}
                    </div>
                    <h3 className="text-[19px] font-bold text-[#1A1A1A] mb-4 leading-tight whitespace-pre-line">{benefit.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <button onClick={() => benefitsApi?.scrollPrev()} className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => benefitsApi?.scrollNext()} className="w-12 h-12 rounded-full border border-gray-400 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 7: START EARNING IN 3 SIMPLE STEPS        */}
      {/* ================================================ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e4eee9 0%, #ffffff 50%, #fdf5ef 100%)' }}>
        {/* Background shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#578f82]/20 to-transparent rounded-br-full pointer-events-none" />
        <div className="absolute top-10 right-0 w-64 h-64 bg-gradient-to-bl from-[#CF956D]/30 to-transparent rounded-bl-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
          <h2 style={{ color: '#578F82', fontFamily: '"adineue PRO", sans-serif' }} className="text-[28px] md:text-[36px] font-bold">
            Start Earning In 3 Simple Steps
          </h2>
          <p className="text-gray-500 mt-4 mb-12 md:mb-24 text-base md:text-lg max-w-2xl mx-auto">Join thousands of service providers, and start your journey to financial independence.</p>

          <div className="flex flex-col md:flex-row justify-center items-stretch gap-10 md:gap-2 lg:gap-6 mb-16 relative mt-8">
            {[
              { title: 'Set Up & Build Your Profile', desc: 'Sign up in just 2 minutes with your mobile number.', icon: User },
              { title: 'Get Verified', desc: 'Complete quick KYC verification with Aadhaar and bank details.', icon: Shield },
              { title: 'Start Earning', desc: 'Go live and start receiving booking requests from verified families.', icon: TrendingUp }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex-1 flex flex-col items-center relative z-10 w-full bg-white/70 backdrop-blur-md rounded-[32px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-transform duration-300">
                  {/* Step Badge */}
                  <div className="absolute -top-5 lg:-top-6 bg-white text-[#578F82] font-bold text-lg lg:text-xl w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-[#e4eee9]" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                    {i + 1}
                  </div>
                  
                  <div
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-[20px] flex items-center justify-center mb-5 lg:mb-6 mt-2 shadow-inner shrink-0"
                    style={{ background: 'linear-gradient(135deg, #578F82 0%, #CF956D 100%)' }}
                  >
                    <step.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 w-full justify-start items-center">
                    <div className="h-[50px] lg:h-[60px] flex items-center justify-center mb-3">
                      <h3 className="text-[#578F82] font-bold text-[20px] lg:text-[24px] mb-3 text-center leading-tight">{step.title}</h3>
                    </div>
                    <p className="text-gray-700 text-[14px] lg:text-[16px] leading-relaxed text-center font-medium">{step.desc}</p>
                  </div>
                </div>

                {/* Dashed Arrow */}
                {i < 2 && (
                  <div className="hidden md:flex flex-col justify-start pt-[64px] lg:pt-[80px] flex-shrink-0 w-[30px] lg:w-[60px] mx-1 lg:mx-2">
                    <svg width="100%" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#CF956D] opacity-40">
                      <path d="M0 12H96" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
                      <path d="M86 4L96 12L86 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 3: BROWSE BY CATEGORIES                   */}
      {/* ================================================ */}
      <section className="py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <p style={{ color: '#CF956D', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[18px] md:text-[25px]">
              Find Your Path
            </p>
            <h2 style={{ color: '#578F82', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[28px] md:text-[36px]">
              Browse By Categories.
            </h2>
          </div>

          {isLoadingCategories ? (
            // Loading state
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6">
              {loadingSkeleton.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[20px] p-3 md:p-5 flex flex-col items-center border-[2px] border-dashed border-gray-200 animate-pulse"
                  style={{ width: 'clamp(110px, 26vw, 160px)' }}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-100 mb-3 md:mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                </div>
              ))}
            </div>
          ) : browseCategories.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6">
                {browseCategories.slice(0, 6).map((cat, i) => {
                  const isSelected = selectedBrowseCategories.includes(cat);
                  const { icon, bgColor } = getBrowseIconWithColor(cat);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleBrowseCategory(cat)}
                      className={`relative bg-white rounded-[20px] p-4 md:p-6 cursor-pointer transition-all duration-300 flex flex-col items-center border-[2px] ${isSelected
                        ? 'border-[#578F82] shadow-lg ring-2 ring-[#578F82]/30 bg-[#578F82]/5'
                        : 'border-dashed border-[#578F82] hover:shadow-lg'
                        }`}
                      style={{ width: 'clamp(110px, 26vw, 160px)' }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#578F82] flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4" style={{ background: bgColor }}>
                        {icon}
                      </div>
                      <h4 className="text-gray-800 font-semibold text-center text-[12px] md:text-[13px] leading-snug break-words w-full">{cat}</h4>
                      <p className="text-gray-500 text-[11px] md:text-xs mt-1.5">{categoryPartnerCounts[i] || 8} partners</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                {browseCategories.slice(6, 12).map((cat, i) => {
                  const isSelected = selectedBrowseCategories.includes(cat);
                  const { icon, bgColor } = getBrowseIconWithColor(cat);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleBrowseCategory(cat)}
                      className={`relative bg-white rounded-[20px] p-4 md:p-6 cursor-pointer transition-all duration-300 flex flex-col items-center border-[2px] ${isSelected
                        ? 'border-[#578F82] shadow-lg ring-2 ring-[#578F82]/30 bg-[#578F82]/5'
                        : 'border-dashed border-[#578F82] hover:shadow-lg'
                        }`}
                      style={{ width: 'clamp(110px, 26vw, 160px)' }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#578F82] flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4" style={{ background: bgColor }}>
                        {icon}
                      </div>
                      <h4 className="text-gray-800 font-semibold text-center text-[12px] md:text-[13px] leading-snug break-words w-full">{cat}</h4>
                      <p className="text-gray-500 text-[11px] md:text-xs mt-1.5">{categoryPartnerCounts[i + 6] || 8} partners</p>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Empty state - no categories available
            <div className="text-center py-10">
              <p className="text-gray-500">No categories available at the moment.</p>
            </div>
          )}

          {/* Continue button — shown when at least one browse category is selected */}
          {selectedBrowseCategories.length > 0 && (
            <div className="flex flex-col items-center mt-10 gap-2">
              <p className="text-[#578F82] text-sm font-medium">
                {selectedBrowseCategories.length} service{selectedBrowseCategories.length > 1 ? 's' : ''} selected
              </p>
              <button
                onClick={handleBrowseContinue}
                className="flex items-center gap-3 px-10 py-3.5 rounded-full bg-[#578F82] text-white font-bold text-[15px] hover:opacity-90 shadow-lg transition-all"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 4: DASHBOARD SHOWCASE                     */}
      {/* ================================================ */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative elements */}

        {/* Top Left Art */}
        <div className="absolute top-0 left-0 pointer-events-none z-0 hidden md:block">
          <img src={topLeftArt} alt="" className="w-auto h-auto opacity-70" />
        </div>

        {/* Left Side Shapes */}
        <div className="absolute top-1/4 left-0 pointer-events-none z-0 hidden md:block">
          <img src={leftSideShapes} alt="" className="w-auto h-auto opacity-90 -translate-x-1/2" />
        </div>

        {/* Right Side Shapes */}
        <div className="absolute top-1/3 right-0 pointer-events-none z-0 hidden md:block">
          <img src={rightShapes} alt="" className="w-auto h-auto opacity-90 translate-x-1/4" />
        </div>

        {[
          { top: '12%', right: '4%' }, { top: '25%', right: '9%' }, { top: '40%', right: '3%' },
          { top: '55%', right: '7%' }, { top: '18%', right: '15%' }, { top: '33%', right: '18%' }
        ].map((pos, i) => (
          <div key={i} className="absolute text-gray-300 text-xl font-light pointer-events-none select-none" style={{ top: pos.top, right: pos.right }}>+</div>
        ))}
        <div className="absolute top-8 right-6 text-gray-300 text-lg pointer-events-none">✕</div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-3 flex flex-col gap-1">
            <p style={{ color: '#CF956D', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[20px] md:text-[25px] m-0 leading-tight">Grow Your Business</p>
            <h2 style={{ color: '#578F82', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }} className="text-[28px] md:text-[36px] m-0 leading-[1.1]">
              Track Your Work.<br/>Increase Your Earnings.
            </h2>
          </div>
          <p className="text-center text-gray-800 max-w-lg mx-auto mb-10 md:mb-16 px-4 md:px-0" style={{ fontSize: '16px', letterSpacing: '0.48px' }}>
            Manage bookings, monitor your earnings, and stay in control of your work — all from one powerful dashboard.
          </p>

          <div className="rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200 max-w-4xl mx-auto bg-white">
            {/* Browser Chrome */}
            <div className="bg-gray-100 px-4 py-3 flex items-center gap-3 border-b border-gray-200">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white/60 rounded-md px-4 py-1.5 text-[11px] text-gray-400 text-center max-w-sm mx-auto">
                Partner.kuddl.co
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <ChevronLeft className="w-4 h-4 hidden sm:block" />
                <ChevronRight className="w-4 h-4 hidden sm:block" />
              </div>
            </div>

            {/* Dashboard Layout */}
            <div className="flex flex-col md:flex-row bg-[#F8FAFC]" style={{ minHeight: '450px' }}>
              {/* Left Sidebar */}
              <div className="hidden md:block w-48 py-6 flex-shrink-0" style={{ backgroundColor: '#578F82' }}>
                <div className="px-6 mb-8 flex justify-center">
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center justify-center">
                    <img src={kuddlLogoFull} alt="Kuddl" className="h-6 w-auto" />
                  </div>
                </div>
                <div className="space-y-1 px-3">
                  {[
                    { label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, active: true },
                    { label: 'My Services', icon: <Star className="w-4 h-4" /> },
                    { label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
                    { label: 'Customers', icon: <Users className="w-4 h-4" /> },
                    { label: 'Payout', icon: <IndianRupee className="w-4 h-4" /> },
                    { label: 'Holidays & Leave', icon: <Clock className="w-4 h-4" /> },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer ${item.active ? 'bg-white/20 text-white font-medium' : 'text-white/70 hover:bg-white/10'}`}>
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Overview</h3>
                    <p className="text-xs text-gray-500">Welcome back, Track your performance.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <Bell className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#CF956D] border-2 border-white shadow-sm" />
                  </div>
                </div>

                {/* Top row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {/* Left Column: Bookings */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                        <p className="text-2xl font-bold text-gray-800">45</p>
                        <p className="text-[10px] text-green-500 mt-1 font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded">24% ▲ from Last Week</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#CF956D]">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Upcoming Bookings</p>
                        <p className="text-2xl font-bold text-gray-800">+12</p>
                        <p className="text-[10px] text-green-500 mt-1 font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded">12% ▲ from Last Week</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#578F82' }}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Completed Bookings</p>
                        <p className="text-2xl font-bold text-gray-800">+12</p>
                        <p className="text-[10px] text-green-500 mt-1 font-medium bg-green-50 w-fit px-1.5 py-0.5 rounded">12% ▲ from Last Week</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00C969]">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Canceled Bookings</p>
                        <p className="text-2xl font-bold text-gray-800">+12</p>
                        <p className="text-[10px] text-red-500 mt-1 font-medium bg-red-50 w-fit px-1.5 py-0.5 rounded">12% ▼ from Last Week</p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500">
                        <X className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Earnings */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="text-center mb-6">
                      <p className="text-2xl font-bold text-[#578F82] mb-1">₹ 1,500 ▲</p>
                      <p className="text-xs text-gray-400">Total earned last week</p>
                    </div>
                    <div className="flex justify-between mb-8">
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500 mb-1">Total Income</p>
                        <p className="text-sm font-bold text-[#578F82]">₹450,025</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] text-gray-500 mb-1">Total Due</p>
                        <p className="text-sm font-bold text-[#CF956D]">₹1,500</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end gap-2 px-4 h-24 mb-6">
                      {/* Simple bar chart */}
                      {[40, 60, 30, 80, 50, 45].map((h, i) => (
                        <div key={i} className="flex-1 bg-[#CF956D] rounded-t-sm" style={{ height: `${h}%`, backgroundColor: i === 3 ? '#578F82' : '#CF956D' }} />
                      ))}
                    </div>
                    <button className="w-full text-xs text-white py-2.5 rounded-lg font-medium" style={{ backgroundColor: '#578F82' }}>
                      View All Earnings
                    </button>
                  </div>

                  {/* Right Column: Subscription */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-bold text-gray-800">Subscription</p>
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">● Current Plan</span>
                    </div>
                    <div className="bg-indigo-50 text-indigo-500 text-xs font-medium px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-6">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Renewal Date : 14 Jan 2025
                    </div>
                    <p className="text-base font-bold text-gray-800 mb-1">Standard Plan</p>
                    <p className="text-xs text-gray-500 mb-6">Our most popular plan for small teams.</p>
                    <p className="text-lg font-bold text-gray-800 mb-6">₹ 299 <span className="text-xs text-gray-500 font-normal">Per/year</span></p>
                    <div className="flex gap-2">
                      <button className="flex-1 text-xs text-white py-2 rounded-lg font-medium" style={{ backgroundColor: '#578F82' }}>Upgrade Plan</button>
                      <button className="flex-1 text-xs text-[#CF956D] py-2 rounded-lg font-medium bg-[#CF956D]/10">Cancel Plan</button>
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Calendar */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-800">Bookings</p>
                      <span className="text-xs text-gray-500 border border-gray-200 px-3 py-1 rounded-full">View All</span>
                    </div>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <ChevronLeft className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-semibold text-gray-600">February 2026</p>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                        <div key={i} className="text-[9px] text-gray-400 text-center font-medium py-1">{d}</div>
                      ))}
                      {[...Array(28)].map((_, i) => (
                        <div key={i} className={`text-[10px] text-center py-1.5 rounded-full mx-1 ${i + 1 === 4 ? 'text-white font-bold' : 'text-gray-600'}`}
                          style={i + 1 === 4 ? { backgroundColor: '#578F82' } : {}}>
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm font-bold text-gray-800">Top Locations</p>
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">01 - 08 Feb 2026</span>
                        <ChevronLeft className="w-3 h-3 text-gray-400 ml-1" />
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-end gap-3 h-24 mt-2 border-l border-b border-gray-100 pb-1 pl-1">
                      {[60, 40, 70, 20, 50].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: '#578F82' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 5: STATS BANNER                           */}
      {/* ================================================ */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-20">
        <div className="rounded-[24px] shadow-2xl p-6 md:p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C69C7B 0%, #578F82 100%)' }}>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-yellow-300 opacity-60">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
              <path d="M20 2l6.18 12.54L40 16.18l-10 9.74L32.36 40 20 33.82 7.64 40 10 25.92 0 16.18l13.82-1.64L20 2z" />
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 text-yellow-300 opacity-40">
            <div className="w-6 h-6 rounded-full bg-current"></div>
          </div>
          <div className="absolute top-1/2 left-8 text-yellow-300 opacity-30 text-2xl">+</div>
          <div className="absolute bottom-8 right-8 text-yellow-300 opacity-50 text-xl">×</div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-white px-4 py-2 rounded-lg">
              <img src={kuddlLogoFull} alt="Kuddl" className="h-8 w-auto" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {platformStats ? [
              { num: platformStats.activeProviders.display, label: platformStats.activeProviders.label },
              { num: platformStats.totalEarnings?.display || '₹50L+', label: platformStats.totalEarnings?.label || 'Earnings' },
              { num: platformStats.averageRating.display, label: platformStats.averageRating.label },
              { num: platformStats.totalBookings.display, label: platformStats.totalBookings.label },
            ].map((stat, i) => (
              <div key={i} className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl py-4 md:py-6 px-2 md:px-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#578F82' }}>{stat.num}</span>
                <span className="text-[10px] md:text-[13px] font-medium text-gray-600 text-center leading-tight">{stat.label}</span>
              </div>
            )) : (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl py-4 md:py-6 px-2 md:px-4 flex flex-col items-center justify-center shadow-sm animate-pulse">
                  <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 5A: DELHI PILOT PROGRAM                   */}
      {/* ================================================ */}
      <section ref={foundingPartnerRef} className="pt-16 md:pt-24 pb-8 relative overflow-hidden bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          
          {/* Desktop SVG Background Layer */}
          <div className="absolute left-4 right-4 md:left-8 md:right-8 lg:left-12 lg:right-12 bottom-10 top-32 z-0 hidden md:block">
            <img src={growWithBg} alt="" className="w-full h-full object-fill drop-shadow-sm" />
          </div>

          <div className="relative z-10 flex flex-col">
            
            {/* TOP ROW: Text on the left, Phone on the right */}
            <div className="flex flex-col md:flex-row justify-between items-start relative z-20 mb-10 md:mb-0">
              {/* Text */}
              <div className="max-w-xl md:pt-8 lg:pt-12 md:ml-8 lg:ml-12 mb-12 md:mb-0">
                <div className="inline-block px-4 md:px-5 py-2 rounded-full bg-[#CF956D] text-white text-xs md:text-sm font-medium mb-6 shadow-sm">
                  Delhi Pilot — Founding Partners Only
                </div>
                <h2 className="text-[32px] md:text-[42px] lg:text-[56px] mb-4 leading-tight text-[#578F82]" style={{ fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }}>
                  Grow with <span className="text-[#CF956D] relative inline-block">
                    Kuddl
                    <img src={belowKuddl} alt="" className="absolute left-0 right-0 -bottom-1 md:-bottom-2 w-full" />
                  </span>
                </h2>
                <p className="text-gray-500 text-sm md:text-base lg:text-lg max-w-md font-light leading-relaxed">
                  Join Delhi's first curated kids services marketplace. Zero fees during pilot. Post-pilot, we charge the lowest commission in the industry.
                </p>
              </div>

              {/* Phone Image */}
              <div className="md:absolute right-0 md:right-12 lg:right-24 top-0 md:top-8 lg:top-4 z-30 w-[180px] sm:w-[220px] md:w-[260px] lg:w-[320px] mx-auto">
                <img src={blankMobile} alt="Kuddl App" className="w-full h-auto drop-shadow-2xl" />
              </div>
            </div>

            {/* BOTTOM ROW: Content inside the green area */}
            <div className="relative z-20 flex flex-col md:flex-row items-center md:items-start justify-between pt-8 pb-16 md:pt-24 md:pb-28 px-6 md:px-12 lg:px-16 mt-4 md:mt-0 md:-mb-12 rounded-3xl md:rounded-none overflow-hidden md:overflow-visible">
              {/* Mobile green background fallback */}
              <div className="absolute inset-0 bg-[#578F82] rounded-3xl md:hidden z-0"></div>

              {/* Left Content (Icon, Heading, Text) */}
              <div className="max-w-md lg:max-w-lg mb-10 md:mb-0 relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#CF956D] flex items-center justify-center text-white shadow-md">
                    <img src={kuddlIcon} alt="Kuddl" className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-white text-2xl md:text-[32px] tracking-wide" style={{ fontFamily: '"adineue PRO", sans-serif', fontWeight: 600 }}>
                    Founding Partner Programme
                  </h3>
                </div>
                <p className="text-white/90 text-sm md:text-[15px] leading-[1.6] font-light">
                  Early partners get exclusive benefits, lifetime priority placement, and introductory rates locked in. Limited to the Delhi pilot cohort.
                </p>
              </div>

              {/* Right Content (3 White Cards) */}
              <div className="flex gap-3 md:gap-4 relative z-30 w-full md:w-auto justify-center md:justify-end md:mt-2">
                {[
                  { percent: '0%', text: 'Commission\nDuring Pilot' },
                  { percent: '0%', text: 'Platform Fee\nDuring Pilot' },
                  { percent: '0%', text: 'Partner\nSpots' }
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-[20px] p-4 md:p-5 lg:p-6 flex flex-col items-center justify-center flex-1 min-w-[100px] md:min-w-[110px] shadow-xl relative" style={{ zIndex: 111 }}>
                    <span className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>{card.percent}</span>
                    <span className="text-[10px] md:text-[11px] text-[#666666] text-center font-medium leading-[1.3] whitespace-pre-line">
                      {card.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Yellow Info Banner */}
          <div className="relative z-30 mx-auto max-w-[95%] md:max-w-[85%] -mt-6 md:-mt-8 mb-4">
            <div className="bg-[#FFF9EA] border border-[#F5E6D3] rounded-2xl p-4 md:p-5 lg:p-6 flex items-start gap-4 shadow-lg">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#CF956D] flex-shrink-0 flex items-center justify-center text-white font-bold text-base md:text-lg">
                !
              </div>
              <p className="text-xs md:text-[13px] text-gray-800 leading-relaxed font-medium md:pt-1">
                <strong className="text-gray-900 font-semibold">When does the pilot end?</strong> Commission kicks in after we cross 500 bookings on the platform OR after 90 days — whichever comes later. You'll get 14 days' notice before the switch. Founding partners lock in introductory rates and ₹0 platform fee.
              </p>
            </div>
          </div>

          {/* Full pricing details, commission tiers and referral rewards live on the
              dedicated /pricing page so the landing stays light. */}
          <div className="relative z-30 flex justify-center mt-6 md:mt-10 mb-2">
            <button
              onClick={() => { navigate('/pricing'); window.scrollTo(0, 0); }}
              className="inline-flex items-center gap-2 bg-[#578F82] hover:bg-[#4a7c70] text-white font-semibold text-sm md:text-base px-7 py-3 rounded-full shadow-lg transition-colors"
            >
              Know more
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 6B: TESTIMONIALS                          */}
      {/* ================================================ */}
      <section className="py-24 bg-[#EAF3F0] relative overflow-hidden">
        {/* Background wave decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 border-t-4 border-r-4 border-[#578F82]/10 rounded-tr-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 border-b-4 border-l-4 border-[#CF956D]/10 rounded-bl-full pointer-events-none" />
        <div className="absolute top-10 left-10 text-[#578F82] opacity-20">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <path d="M0,50 Q25,25 50,50 T100,50 M0,60 Q25,35 50,60 T100,60 M0,70 Q25,45 50,70 T100,70" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="absolute bottom-10 right-10 text-[#578F82] opacity-20 transform rotate-180">
          <svg width="200" height="200" viewBox="0 0 100 100" fill="none">
            <path d="M0,50 Q25,25 50,50 T100,50 M0,60 Q25,35 50,60 T100,60 M0,70 Q25,45 50,70 T100,70" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-10 md:mb-16 flex flex-col">
            <h2 className="text-[32px] md:text-[42px] font-bold text-[#578F82] mb-2 order-1" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
              Testimonials
            </h2>
            <span className="text-[#C69C7B] font-bold tracking-widest text-xs md:text-sm uppercase block order-2">Client Success Stories</span>
          </div>

          {/* Desktop Scrollable Carousel */}
          <div className="hidden md:block relative">
            <div className="overflow-hidden pb-12 pt-4 -mx-4 px-4" ref={desktopTestimonialsRef}>
              <div className="flex">
            {[
              { 
                text: "I used to depend only on referrals earlier, but with Kuddl Adventure, I started getting consistent birthday bookings. Parents come with clear requirements, and the whole process feels much more professional now. It's honestly helped me grow faster than I expected.", 
                name: 'Rohit Verma', 
                location: 'Delhi', 
                role: 'Kids Party Planner',
                category: 'Adventure',
                subcategory: 'Party Planner / Decor',
                bg: '#578F82' 
              },
              { 
                text: "Through Kuddl Bloom, I've been able to reach parents who actually value structured learning for their kids. My phonics and early learning sessions are now full, and I've seen real continuity with families coming back. It feels good to focus on teaching, not chasing leads.", 
                name: 'Neha Gupta', 
                location: 'Gurugram', 
                role: 'Phonics & Early Learning Educator',
                category: 'Bloom',
                subcategory: 'Child Development / Classes',
                bg: '#578F82' 
              },
              { 
                text: "As a lactation consultant, trust is everything. Kuddl helped bridge that gap for me. The kind of families I connect with here are aware and respectful, and the bookings are much more organised. It's made my practice smoother and more reliable.", 
                name: 'Dr. Shalini Mehta', 
                location: 'Delhi', 
                role: 'Lactation Consultant',
                category: 'Care',
                subcategory: 'Infant / Therapy Services',
                bg: '#578F82' 
              },
              { 
                text: "I conduct weekend sensory play workshops, and earlier it was hard to get the right audience. With Kuddl Discover, I've started seeing parents who are genuinely interested in these activities. My sessions fill up quicker, and the experience overall feels more structured.", 
                name: 'Ayesha Khan', 
                location: 'Noida', 
                role: 'Sensory Play Facilitator',
                category: 'Discover',
                subcategory: 'Workshops / Camps',
                bg: '#578F82' 
              },
              { 
                text: "Earlier most of my students came through word of mouth in my locality. I didn't really have time to market myself properly. With Kuddl, parents from across Delhi started discovering my dance classes, and I've seen a steady increase in enquiries without putting extra effort into marketing.", 
                name: 'Ankita Singh', 
                location: 'Delhi', 
                role: 'Dance & Movement Coach',
                category: 'Bloom',
                subcategory: 'Dance / Movement Classes',
                bg: '#578F82' 
              },
              { 
                text: "I host small weekend workshops, but reaching the right audience was always a struggle. Through Kuddl Discover, I've connected with parents who are actively looking for these experiences. It's not just more bookings, but the right kind of audience now.", 
                name: 'Ritika Jain', 
                location: 'Noida', 
                role: 'Workshop Facilitator',
                category: 'Discover',
                subcategory: 'Workshops / Activities',
                bg: '#578F82' 
              },
              { 
                text: "Before Kuddl, most of my work came through referrals, which made things a bit unpredictable. Now, I'm getting consistent enquiries from parents who are already aware of what they're looking for. It's helped me focus more on my work instead of worrying about visibility.", 
                name: 'Dr. Karan Malhotra', 
                location: 'Gurugram', 
                role: 'Child Psychologist',
                category: 'Care',
                subcategory: 'Child Psychology / Counseling',
                bg: '#578F82' 
              },
              { 
                text: "I used to spend a lot on ads and still wasn't sure if I was reaching the right parents. After joining Kuddl, I started getting direct bookings for kids' events and shoots. It feels more streamlined, and I'm able to focus on delivering better experiences rather than chasing leads.", 
                name: 'Siddharth Arora', 
                location: 'Delhi', 
                role: 'Kids Event Photographer',
                category: 'Adventure',
                subcategory: 'Photographer / Events',
                bg: '#578F82' 
              },
            ].map((test, i) => (
              <div key={i} className="flex-[0_0_auto] min-w-0 pr-6">
                <div className="rounded-3xl p-8 text-white relative shadow-lg flex flex-col h-full w-[380px]" style={{ background: test.bg }}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current text-yellow-400 border-yellow-400" />
                    ))}
                  </div>
                  
                  {/* Badges Container */}
                  <div className="flex flex-col items-start gap-2 mb-6">
                     <div className="inline-block bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap truncate max-w-full" title={`${test.category} - ${test.subcategory}`}>
                      {test.category} - {test.subcategory}
                    </div>
                    <div className="inline-block bg-[#CF956D] text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                      {test.role}
                    </div>
                  </div>

                  <p className="text-white/90 text-sm leading-relaxed mb-8 flex-1">
                    "{test.text}"
                  </p>
                  <div className="pt-5 border-t border-white/20 mt-auto w-full">
                    <h4 className="font-bold text-white text-lg">{test.name}</h4>
                    <p className="text-white/70 text-sm">{test.location}</p>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex gap-4 mt-12 justify-center">
              <button 
                onClick={() => desktopTestimonialsApi?.scrollPrev()} 
                disabled={!canScrollTestimonialsPrev}
                className="w-12 h-12 rounded-full border-2 border-[#578F82] flex items-center justify-center text-[#578F82] hover:bg-[#578F82] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#578F82]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => desktopTestimonialsApi?.scrollNext()} 
                disabled={!canScrollTestimonialsNext}
                className="w-12 h-12 rounded-full border-2 border-[#578F82] flex items-center justify-center text-[#578F82] hover:bg-[#578F82] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#578F82]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="md:hidden relative">
            {/* We'll use a separate ref for mobile to prevent conflicting state with desktop */}
            <div className="overflow-hidden pb-12 pt-4 -mx-4 px-4" ref={mobileTestimonialsRef}>
              <div className="flex">
                {[
                  { 
                    text: "I used to depend only on referrals earlier, but with Kuddl Adventure, I started getting consistent birthday bookings. Parents come with clear requirements, and the whole process feels much more professional now. It's honestly helped me grow faster than I expected.", 
                    name: 'Rohit Verma', 
                    location: 'Delhi', 
                    role: 'Kids Party Planner',
                    category: 'Adventure',
                    subcategory: 'Party Planner / Decor',
                    bg: '#578F82' 
                  },
                  { 
                    text: "Through Kuddl Bloom, I've been able to reach parents who actually value structured learning for their kids. My phonics and early learning sessions are now full, and I've seen real continuity with families coming back. It feels good to focus on teaching, not chasing leads.", 
                    name: 'Neha Gupta', 
                    location: 'Gurugram', 
                    role: 'Phonics & Early Learning Educator',
                    category: 'Bloom',
                    subcategory: 'Child Development / Classes',
                    bg: '#578F82' 
                  },
                  { 
                    text: "As a lactation consultant, trust is everything. Kuddl helped bridge that gap for me. The kind of families I connect with here are aware and respectful, and the bookings are much more organised. It's made my practice smoother and more reliable.", 
                    name: 'Dr. Shalini Mehta', 
                    location: 'Delhi', 
                    role: 'Lactation Consultant',
                    category: 'Care',
                    subcategory: 'Infant / Therapy Services',
                    bg: '#578F82' 
                  },
                  { 
                    text: "I conduct weekend sensory play workshops, and earlier it was hard to get the right audience. With Kuddl Discover, I've started seeing parents who are genuinely interested in these activities. My sessions fill up quicker, and the experience overall feels more structured.", 
                    name: 'Ayesha Khan', 
                    location: 'Noida', 
                    role: 'Sensory Play Facilitator',
                    category: 'Discover',
                    subcategory: 'Workshops / Camps',
                    bg: '#578F82' 
                  },
                  { 
                    text: "Earlier most of my students came through word of mouth in my locality. I didn't really have time to market myself properly. With Kuddl, parents from across Delhi started discovering my dance classes, and I've seen a steady increase in enquiries without putting extra effort into marketing.", 
                    name: 'Ankita Singh', 
                    location: 'Delhi', 
                    role: 'Dance & Movement Coach',
                    category: 'Bloom',
                    subcategory: 'Dance / Movement Classes',
                    bg: '#578F82' 
                  },
                  { 
                    text: "I host small weekend workshops, but reaching the right audience was always a struggle. Through Kuddl Discover, I've connected with parents who are actively looking for these experiences. It's not just more bookings, but the right kind of audience now.", 
                    name: 'Ritika Jain', 
                    location: 'Noida', 
                    role: 'Workshop Facilitator',
                    category: 'Discover',
                    subcategory: 'Workshops / Activities',
                    bg: '#578F82' 
                  },
                  { 
                    text: "Before Kuddl, most of my work came through referrals, which made things a bit unpredictable. Now, I'm getting consistent enquiries from parents who are already aware of what they're looking for. It's helped me focus more on my work instead of worrying about visibility.", 
                    name: 'Dr. Karan Malhotra', 
                    location: 'Gurugram', 
                    role: 'Child Psychologist',
                    category: 'Care',
                    subcategory: 'Child Psychology / Counseling',
                    bg: '#578F82' 
                  },
                  { 
                    text: "I used to spend a lot on ads and still wasn't sure if I was reaching the right parents. After joining Kuddl, I started getting direct bookings for kids' events and shoots. It feels more streamlined, and I'm able to focus on delivering better experiences rather than chasing leads.", 
                    name: 'Siddharth Arora', 
                    location: 'Delhi', 
                    role: 'Kids Event Photographer',
                    category: 'Adventure',
                    subcategory: 'Photographer / Events',
                    bg: '#578F82' 
                  },
                ].map((test, i) => (
                  <div key={i} className="flex-[0_0_85%] mr-4 rounded-[24px] p-6 text-white relative shadow-lg flex flex-col min-h-full" style={{ background: test.bg }}>
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current text-yellow-400 border-yellow-400" />
                      ))}
                    </div>
                    
                    {/* Badges Container - Stacked vertically as requested */}
                    <div className="flex flex-col items-start gap-2 mb-5">
                      <div className="inline-block bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap truncate max-w-full" title={`${test.category} - ${test.subcategory}`}>
                        {test.category} - {test.subcategory}
                      </div>
                      <div className="inline-block bg-[#CF956D] text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                        {test.role}
                      </div>
                    </div>

                    <p className="text-white/90 text-[15px] leading-relaxed mb-6 flex-1 h-full">
                      "{test.text}"
                    </p>
                    <div className="pt-4 border-t border-white/20 mt-auto w-full">
                      <h4 className="font-bold text-white text-base">{test.name}</h4>
                      <p className="text-white/70 text-sm">{test.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center mt-6 gap-2">
              {[...Array(8)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => mobileTestimonialsApi?.scrollTo(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentTestimonialSlide ? 'bg-[#578F82]' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 6D: KUDDL BOOST                           */}
      {/* ================================================ */}
      <section className="py-12 bg-white pb-24 relative">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            {/* Decorative dots */}
            <div className="absolute top-4 left-4 grid grid-cols-4 gap-2 opacity-20 z-0">
              {[...Array(16)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />)}
            </div>

            <div className="flex-shrink-0 relative z-10 mt-4 md:mt-0">
              <button className="bg-[#578F82] text-white font-bold px-8 py-3 rounded-full flex items-center gap-3">
                COMING SOON <MessageCircle className="w-5 h-5" />
              </button>
             </div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <h3 className="text-3xl font-bold text-[#578F82] mb-4" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                Kuddl Boost — Premium Visibility
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                Optional paid feature for priority search placement, featured homepage spots, and promoted listing badges. Pay only if you want extra visibility — your organic listing is always free. Earn Boost credits through referrals.
              </p>
            </div>

            {/* Right graphic */}
            <div className="hidden md:block w-32 h-32 relative flex-shrink-0">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EAF3F0] rounded-tl-[3rem] rounded-br-[3rem]" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#FDE6B4] rounded-tr-[3rem] rounded-bl-[3rem]" />
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />

              {/* Plus grid pattern */}
              <div className="absolute -right-8 -top-8 grid grid-cols-3 gap-3 opacity-20">
                {[...Array(9)].map((_, i) => <span key={i} className="text-xl leading-none text-[#578F82]">+</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* SECTION 8: STUDIO OR AGENCY / FAQ / FINAL CTA     */}
      {/* ================================================ */}
      <section className="bg-white">
        {/* Studio / Academy Banner */}
        <div className="bg-[#C69C7B] py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#578F82] rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FDE6B4] rounded-tl-full opacity-50" />

          <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                Running a studio, academy, or multi-location team?
              </h2>
              <p className="text-white/90 text-lg max-w-xl">
                We'll create a custom plan with volume discounts, multi-provider support, and a dedicated account manager.
              </p>
            </div>
            <div>
              <button onClick={() => setShowContactModal(true)} className="bg-[#578F82] text-white font-bold px-8 py-3 rounded-full hover:bg-[#4a7c70] transition-colors shadow-lg flex items-center gap-2">
                Talk to Us <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="bg-[#F8FAF9] rounded-[2rem] md:rounded-[3rem] p-6 md:p-16">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-[28px] md:text-3xl font-bold text-[#578F82] mb-3" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                FAQs
              </h2>
              <p className="text-gray-600 font-medium">Got questions? We've got answers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: 'Do I need to pay anything to join Kuddl?',
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  a: 'Joining Kuddl is completely free for the first 30 days. During this period, there is no subscription fee and no commission. You only pay after the free trial period ends.'
                },
                {
                  q: 'How do payments work?',
                  icon: <IndianRupee className="w-5 h-5" />,
                  a: 'Payments are processed directly to your linked bank account. You can track your earnings and upcoming payouts right from your dashboard.'
                },
                {
                  q: 'How do I get started as a Kuddl partner?',
                  icon: <Calendar className="w-5 h-5" />,
                  a: 'Simply sign up using your mobile number, verify your KYC details, set up your profile and services, and you are ready to receive bookings.'
                },
                {
                  q: 'Can I work across multiple service categories?',
                  icon: <Users className="w-5 h-5" />,
                  a: 'Yes, you can list services in multiple categories as long as you have the required qualifications and experience for each.'
                },
                {
                  q: 'What happens if I don\'t want to continue after the free period?',
                  icon: <Home className="w-5 h-5" />,
                  a: 'You can choose to opt-out at any time. There are no lock-in contracts or cancellation fees.'
                },
                {
                  q: 'Do I need to be tech-savvy to use Kuddl?',
                  icon: <Home className="w-5 h-5" />,
                  a: 'Not at all. The Kuddl partner app is designed to be very intuitive and easy to use. Our support team is also always available to help.'
                }
              ].map((faq, i) => (
                <div
                  key={i}
                  className={`rounded-3xl p-6 shadow-sm border transition-colors cursor-pointer ${expandedFaq === i ? 'bg-white border-[#578F82]/20' : 'bg-white border-gray-100 hover:border-[#578F82]/30'}`}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex items-center gap-3 font-bold ${expandedFaq === i ? 'text-[#578F82]' : 'text-gray-800'}`}>
                      <div className={expandedFaq === i ? 'text-[#578F82]' : 'text-gray-400'}>
                        {faq.icon}
                      </div>
                      {faq.q}
                    </div>
                    <button className={`w-6 h-6 rounded-md flex items-center justify-center font-bold flex-shrink-0 ${expandedFaq === i ? 'bg-[#578F82] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {expandedFaq === i ? '-' : '+'}
                    </button>
                  </div>
                  {expandedFaq === i && (
                    <div className="overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      <p className="text-gray-500 text-sm mt-4 leading-relaxed pl-8">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ */}
      {/* FOOTER                                            */}
      {/* ================================================ */}
      <footer style={{ backgroundColor: '#578F82' }} className="text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <div className="bg-white px-4 py-2 rounded-lg inline-block">
                  <img src={kuddlLogoFull} alt="Kuddl" className="h-8 w-auto" />
                </div>
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
                <li><button onClick={() => { navigate('/help'); window.scrollTo(0, 0); }} className="hover:text-white transition">Help Center</button></li>
                <li><button onClick={() => { navigate('/contact'); window.scrollTo(0, 0); }} className="hover:text-white transition">Contact Us</button></li>
                <li><button onClick={() => { navigate('/trust-safety'); window.scrollTo(0, 0); }} className="hover:text-white transition">Trust &amp; Safety</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={() => { navigate('/about'); window.scrollTo(0, 0); }} className="hover:text-white transition">About Us</button></li>
                <li><button onClick={() => { navigate('/careers'); window.scrollTo(0, 0); }} className="hover:text-white transition">Careers</button></li>
                <li><button onClick={() => { navigate('/press'); window.scrollTo(0, 0); }} className="hover:text-white transition">Press</button></li>
                <li><button onClick={() => { navigate('/blog'); window.scrollTo(0, 0); }} className="hover:text-white transition">Blog</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/70">
            <p>&copy; 2026 Kuddl. All rights reserved. Made with love for childcare service providers across India.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Sticky Icon */}
      <a
        href="https://wa.me/919311935596?text=Hi%2C%20I%20want%20to%20join%20as%20a%20partner"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 hover:shadow-3xl group"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Chat with us
        </span>
      </a>

      {/* ================================================ */}
      {/* CATEGORY SELECTION MODAL                          */}
      {/* ================================================ */}
      {showCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`${selectedCategory.color} p-3 rounded-xl flex-shrink-0`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {selectedCategory.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{selectedCategory.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Select the service(s) you would like to offer:
              </h4>

              {selectedCategory.services && selectedCategory.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCategory.services.map((service: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]/10'
                        : 'border-gray-200 hover:border-[#578f82]/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(service)}
                        onChange={() => handleSubcategoryToggle(service)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]'
                        : 'border-gray-300'
                        }`}>
                        {selectedSubcategories.includes(service) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{service}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCategory.module === 'CARE' && [
                    'Full-time nannies', 'Part-time Nanny', 'Babysitter', 'Night Nanny',
                    'Postpartum Care', 'Elderly Care', 'Special Needs Care', 'Emergency Care'
                  ].map((service: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]/10'
                        : 'border-gray-200 hover:border-[#578f82]/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(service)}
                        onChange={() => handleSubcategoryToggle(service)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]'
                        : 'border-gray-300'
                        }`}>
                        {selectedSubcategories.includes(service) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{service}</span>
                    </label>
                  ))}

                  {selectedCategory.module === 'BLOOM' && [
                    'Music & Movement', 'Early Learning', 'Sensory Play', 'Arts & Crafts',
                    'Storytelling', 'Physical Development', 'Cognitive Games', 'Language Development'
                  ].map((service: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]/10'
                        : 'border-gray-200 hover:border-[#578f82]/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(service)}
                        onChange={() => handleSubcategoryToggle(service)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]'
                        : 'border-gray-300'
                        }`}>
                        {selectedSubcategories.includes(service) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{service}</span>
                    </label>
                  ))}

                  {selectedCategory.module === 'EVENTS' && [
                    'Birthday parties', 'Themed Parties', 'Decoration Services', 'Entertainment',
                    'Photography', 'Catering', 'Return Gifts', 'Venue Booking'
                  ].map((service: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]/10'
                        : 'border-gray-200 hover:border-[#578f82]/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(service)}
                        onChange={() => handleSubcategoryToggle(service)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]'
                        : 'border-gray-300'
                        }`}>
                        {selectedSubcategories.includes(service) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{service}</span>
                    </label>
                  ))}

                  {selectedCategory.module === 'DISCOVER' && [
                    'Workshops', 'Educational Events', 'Skill Development', 'Community Events',
                    'Learning Sessions', 'Interactive Programmes', 'Group Activities', 'Seminars'
                  ].map((service: string, index: number) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]/10'
                        : 'border-gray-200 hover:border-[#578f82]/50'
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(service)}
                        onChange={() => handleSubcategoryToggle(service)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${selectedSubcategories.includes(service)
                        ? 'border-[#578f82] bg-[#578f82]'
                        : 'border-gray-300'
                        }`}>
                        {selectedSubcategories.includes(service) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-800 font-medium">{service}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Show custom interest field only when 'Other' is selected */}
              {selectedSubcategories.includes('Other') && (
                <div className="mt-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ✏️ Add your own interest <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={otherServiceText}
                    onChange={(e) => setOtherServiceText(e.target.value)}
                    placeholder="e.g. Puppet Shows, Science Experiments…"
                    className="w-full px-4 py-3 border-2 border-dashed border-[#578f82]/50 rounded-lg focus:border-[#578f82] focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>
              )}

              {(selectedSubcategories.length > 0 || otherServiceText.trim()) && (
                <div className="mt-4 p-3 bg-[#578f82]/10 rounded-lg">
                  <p className="text-sm text-[#578f82] font-medium">
                    Selected:{' '}
                    {[
                      ...selectedSubcategories,
                      ...(otherServiceText.trim() ? [otherServiceText.trim()] : [])
                    ].join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinAsPartner}
                  disabled={selectedSubcategories.length === 0 && !otherServiceText.trim()}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${selectedSubcategories.length > 0 || otherServiceText.trim()
                    ? 'bg-[#578f82] text-white hover:bg-[#4a7c70] shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Join as Partner ({selectedSubcategories.length + (otherServiceText.trim() ? 1 : 0)} selected)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default Landing;
