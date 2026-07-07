import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Heart, Search, ArrowLeft } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import kuddlLogoFull from '../assets/images/kuddl-logo-full.svg';
import adventureIcon from '../assets/images/adventure.svg';
import bloomIcon from '../assets/images/bloom.svg';
import rewardImg from '../assets/images/reward.svg';
import blankMobile from '../assets/images/blank-mobile.png';
import belowKuddl from '../assets/images/below_kuddl.svg';
import kuddlIcon from '../assets/images/kuddl-icon.svg';

/**
 * Dedicated /pricing route. Contains the three sections that used to live on
 * the landing page (Founding Partner / Growth split, introductory commission
 * tiles and the Refer-Partners block). The landing keeps only the "Grow with
 * Kuddl" intro section + a "Know more" button that routes here.
 */
const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const pricingRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      <main className="pt-28 pb-12">
        {/* ================================================ */}
        {/* SECTION 0: GROW WITH KUDDL (from landing)        */}
        {/* ================================================ */}
        <section className="relative overflow-hidden bg-white pb-8 md:pb-12">
          {/* Green Background */}
          <div className="absolute bottom-0 left-0 right-0 z-0 hidden md:block bg-[#578F82]" style={{ height: '60%' }}>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
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
                    Join Delhi's first curated kids' services marketplace. Zero fees during pilot. Post-pilot, we charge the lowest commission in the industry.
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
          </div>
        </section>

        {/* Page title */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10 mt-12">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#578F82] mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1
            className="text-[36px] md:text-[52px] font-bold text-[#578F82] leading-tight"
            style={{ fontFamily: '"adineue PRO", sans-serif' }}
          >
            Pricing
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Everything you need to know about our Founding Partner Programme, post-pilot rates, and the Refer-Partners rewards.
          </p>
        </div>

        {/* ================================================ */}
        {/* SECTION A: PRICING PLANS (Founding / Growth)      */}
        {/* ================================================ */}
        <section className="py-12 bg-white relative overflow-hidden">
          <div className="absolute top-10 left-0 w-32 h-64 border-r-2 border-t-2 border-[#578F82]/10 rounded-tr-full" />
          <div className="absolute bottom-10 right-0 w-32 h-64 border-l-2 border-b-2 border-[#CF956D]/10 rounded-bl-full" />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-col gap-10">
              {/* Founding Partner Card */}
              <div className="bg-white rounded-[2rem] border border-[#C69C7B] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row relative">
                <div className="md:w-[320px] p-10 flex flex-col items-center justify-center text-center relative" style={{ background: '#C69C7B' }}>
                  <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#C69C7B] transform -translate-y-1/2 rotate-45 hidden md:block z-40" />
                  <div className="absolute -bottom-4 right-1/2 w-8 h-8 bg-[#C69C7B] transform -translate-x-1/2 rotate-45 md:hidden z-40" />

                  <h3 className="text-white text-3xl font-bold mb-6 relative z-10" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Limited Spots</h3>
                  <span className="bg-white text-gray-800 text-xs font-bold px-5 py-2 rounded-full mb-8 relative z-10">During Pilot*</span>
                  <div className="text-white text-7xl font-bold mb-8 flex items-start justify-center relative z-10">
                    <span className="text-5xl mt-2 mr-1">₹</span>0
                  </div>
                  <div className="bg-white rounded-full px-4 py-2.5 text-[#C69C7B] text-sm font-bold w-full shadow-md mb-4 relative z-10">
                    100% of your earnings stay with you
                  </div>
                  <p className="text-white/80 text-xs relative z-10 font-medium">*10-15% commission waived for pilot</p>
                </div>

                <div className="flex-1 p-10 md:p-14 bg-white relative z-10">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Founding Partner</h3>
                  <p className="text-[#578F82] font-medium text-sm mb-1">Your first few months on Kuddl — completely free. Keep 100% of every booking.</p>
                  <p className="text-[#C69C7B] text-sm mb-10 font-medium">Zero commission · Zero platform fee · Zero risk</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-10">
                    {[
                      'List all your services & get discovered by parents',
                      'WhatsApp onboarding & dedicated support',
                      'Accept & manage bookings from the app',
                      '"Founding Partner" badge — permanent on your profile',
                      'Free professional listing photoshoot',
                      'Introductory commission rates locked in',
                      'Secure payments & partner dashboard',
                      '₹0 platform fee — even when future partners pay',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/mobile-verification')}
                    className="bg-[#C69C7B] text-white font-bold px-8 py-4 rounded-full hover:bg-[#b0886a] transition-colors text-sm shadow-lg"
                  >
                    JOIN AS FOUNDING PARTNER
                  </button>
                </div>
              </div>

              {/* Growth / After Pilot Ends */}
              <div className="bg-white rounded-[2rem] border border-[#578F82] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row relative">
                <div className="flex-1 p-10 md:p-14 bg-white md:order-1 order-2 relative z-10">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Growth</h3>
                  <p className="text-[#578F82] font-medium text-sm mb-1">Introductory launch rates — the lowest in the kids services industry. Founding partners lock in these rates even as they evolve.</p>
                  <p className="text-[#C69C7B] text-sm mb-10 font-medium">10-15% introductory commission by category.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-10">
                    <div className="flex items-start gap-3 md:col-span-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Everything in Founding Partners, plus:</span>
                    </div>
                    {[
                      'Unlimited bookings — pay only when you earn',
                      'Express 3-day payouts for Founding Partners (weekly standard payouts)',
                      'Priority support & dedicated WhatsApp channel',
                      'Advanced insights & performance tracking',
                      'Parents pay a small convenience fee — not you',
                      'Refer partners → earn Boost credits & rewards',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/mobile-verification')}
                    className="bg-[#578F82] text-white font-bold px-8 py-4 rounded-full hover:bg-[#4a7c70] transition-colors text-sm shadow-lg"
                  >
                    Start During Pilot
                  </button>
                </div>

                <div className="md:w-[320px] p-10 flex flex-col items-center justify-center text-center relative md:order-2 order-1 overflow-visible" style={{ background: '#578F82' }}>
                  <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#578F82] transform -translate-y-1/2 rotate-45 hidden md:block z-40" />
                  <div className="absolute -top-4 left-1/2 w-8 h-8 bg-[#578F82] transform -translate-x-1/2 rotate-45 md:hidden z-40" />

                  <h3 className="text-white text-3xl font-bold mb-6 relative z-10" style={{ fontFamily: '"adineue PRO", sans-serif' }}>After Pilot Ends</h3>
                  <span className="bg-white text-gray-800 text-xs font-bold px-6 py-2 rounded-full mb-8 relative z-10">Post Pilot</span>
                  <div className="text-white text-7xl font-bold mb-8 flex items-start justify-center relative z-10">
                    <span className="text-5xl mt-2 mr-1">₹</span>0
                  </div>
                  <div className="bg-[#FFF5EC] text-[#C69C7B] text-sm font-bold px-6 py-3 rounded-full shadow-md w-max mx-auto whitespace-nowrap relative z-10">
                    per month for Founding Partners
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Slider */}
            <div className="md:hidden relative">
              <div className="overflow-hidden" ref={pricingRef}>
                <div className="flex items-stretch">
                  <div className="flex-[0_0_90%] mr-4">
                    <div className="bg-white rounded-2xl border border-[#C69C7B] shadow-lg overflow-hidden flex flex-col h-full">
                      <div className="p-6 text-center" style={{ background: '#C69C7B' }}>
                        <h3 className="text-white text-xl font-bold mb-3" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Limited Spots</h3>
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">During Pilot*</span>
                        <div className="text-white text-4xl font-bold mb-4 flex items-start justify-center">
                          <span className="text-2xl mt-1 mr-1">₹</span>0
                        </div>
                        <div className="bg-white rounded-full px-3 py-2 text-[#C69C7B] text-xs font-bold mb-2">
                          100% earnings stay with you
                        </div>
                        <p className="text-white/80 text-xs font-medium">*10-15% commission waived</p>
                      </div>
                      <div className="p-6 bg-white">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Founding Partner</h3>
                        <p className="text-[#578F82] font-medium text-sm mb-1">Your first months on Kuddl — completely free.</p>
                        <p className="text-[#C69C7B] text-sm font-medium" style={{ minHeight: '40px', marginBottom: '24px' }}>Zero commission · Zero platform fee</p>
                        <button
                          onClick={() => navigate('/mobile-verification')}
                          className="bg-[#C69C7B] text-white font-bold px-6 py-3 rounded-full text-sm w-full"
                        >
                          JOIN AS FOUNDING PARTNER
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-[0_0_90%] mr-4">
                    <div className="bg-white rounded-2xl border border-[#578F82] shadow-lg overflow-hidden flex flex-col h-full">
                      <div className="p-6 text-center" style={{ background: '#578F82' }}>
                        <h3 className="text-white text-xl font-bold mb-3" style={{ fontFamily: '"adineue PRO", sans-serif' }}>After Pilot Ends</h3>
                        <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">Post Pilot</span>
                        <div className="text-white text-4xl font-bold mb-4 flex items-start justify-center">
                          <span className="text-2xl mt-1 mr-1">₹</span>0
                        </div>
                        <div className="bg-[#FFF5EC] text-[#C69C7B] text-xs font-bold px-3 py-2 rounded-full mb-2">
                          per month for Founding Partners
                        </div>
                        <p className="text-white/80 text-xs font-medium invisible">*Placeholder for alignment</p>
                      </div>
                      <div className="p-6 bg-white">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>Growth</h3>
                        <p className="text-[#578F82] font-medium text-sm mb-1">Introductory launch rates — the lowest in the industry.</p>
                        <p className="text-[#C69C7B] text-sm font-medium" style={{ minHeight: '40px', marginBottom: '24px' }}>10-15% introductory commission by category</p>
                        <button
                          onClick={() => navigate('/mobile-verification')}
                          className="bg-[#578F82] text-white font-bold px-6 py-3 rounded-full hover:bg-[#4a7c70] transition-colors text-sm w-full"
                        >
                          Start During Pilot
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-6 gap-2">
                {[0, 1].map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${i === 0 ? 'bg-[#578F82]' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* SECTION B: INTRODUCTORY COMMISSION                */}
        {/* ================================================ */}
        <section className="py-20 bg-white relative">
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 50%, #F5F5F5 100%)' }} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="mb-10 md:mb-16">
              <h2 className="mb-4 text-[26px] md:text-[32px]" style={{ color: '#578F82', fontFamily: '"adineue PRO", sans-serif', fontWeight: 700 }}>
                Introductory Commission by Category (post-pilot)
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-4xl">
                Launch rates for Delhi pilot partners. Different services, different economics — we've set rates fair for your category. Parents also pay a small 3-5% convenience fee, so the full cost doesn't fall on you.
              </p>
            </div>

            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Adventure', desc: "Kids' parties, events, and celebration experiences", rate: '15%', color: '#FB5261', icon: <img src={adventureIcon} alt="Adventure" className="w-8 h-8" /> },
                { title: 'Bloom',     desc: "Kids' learning, sports, and developmental classes",   rate: '12%', color: '#F59762', icon: <img src={bloomIcon} alt="Bloom" className="w-8 h-8" /> },
                { title: 'Care',      desc: 'Childcare, at-home services, and wellbeing support', rate: '10%', color: '#00B6AA', icon: <Heart className="w-8 h-8" /> },
                { title: 'Discover',  desc: "Kids' workshops and events near you",                rate: '12%', color: '#8B5CF6', icon: <Search className="w-8 h-8" /> },
              ].map((cat, i) => (
                <div key={i} className="relative pt-6">
                  <div className="absolute top-0 right-8 w-16 h-16 rounded-2xl flex items-center justify-center z-10 shadow-lg" style={{ backgroundColor: cat.color }}>
                    <div className="text-white">{cat.icon}</div>
                  </div>
                  <div className="rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden" style={{ backgroundColor: cat.color, minHeight: '280px' }}>
                    <h3 className="text-white font-bold text-2xl mb-3 mt-4" style={{ fontFamily: '"adineue PRO", sans-serif' }}>{cat.title}</h3>
                    <p className="text-white/90 text-sm mb-8 leading-snug px-2 flex-1">{cat.desc}</p>
                    <div className="text-white font-bold text-[56px] leading-none mb-2" style={{ fontFamily: 'sans-serif' }}>{cat.rate}</div>
                    <p className="text-white/80 text-xs font-bold tracking-wider mb-6">PER BOOKING</p>
                    <div className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full">0% During Pilot</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden grid grid-cols-2 gap-4">
              {[
                { title: 'Adventure', desc: 'Birthday planners, entertainers, party organisers', rate: '15%', color: 'bg-[#FB5261]',                                  icon: <img src={adventureIcon} alt="Adventure" className="w-6 h-6" /> },
                { title: 'Bloom',     desc: 'Kids learning, sports and developmental classes',   rate: '12%', color: 'bg-[#F59762]',                                  icon: <img src={bloomIcon} alt="Bloom" className="w-6 h-6" /> },
                { title: 'Care',      desc: 'Care & Therapy services for children',              rate: '10%', color: 'bg-[#00B6AA]',                                  icon: <Heart className="w-6 h-6" /> },
                { title: 'Discover',  desc: "Kids' workshops, activities, and events near you.", rate: '12%', color: 'bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed]', icon: <Search className="w-6 h-6" /> },
              ].map((cat, i) => (
                <div key={i} className={`${cat.color} rounded-xl p-4 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-between text-center min-h-[180px]`}>
                  <div className="text-white mb-3 mt-1 scale-75">{cat.icon}</div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>{cat.title}</h3>
                    <p className="text-white/90 text-xs leading-relaxed mb-3">{cat.desc}</p>
                    <div className="text-white font-bold text-2xl mb-1" style={{ fontFamily: '"adineue PRO", sans-serif' }}>{cat.rate}</div>
                    <p className="text-white/80 text-[10px] font-bold tracking-wider mb-2">PER BOOKING</p>
                    <div className="bg-white/20 text-white text-[9px] font-bold px-2 py-1 rounded-full">0% During Pilot</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* SECTION B2: HOW KUDDL COMPARES                    */}
        {/* ================================================ */}
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)' }}>
          {/* Decorative corner blocks */}
          <div className="absolute -left-10 top-20 w-32 h-32 bg-[#578F82] rounded-[3rem] rotate-12 opacity-80" />
          <div className="absolute -right-10 bottom-20 w-32 h-32 bg-[#578F82] rounded-[3rem] rotate-12 opacity-80" />

          <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-[32px] md:text-[42px] font-bold text-[#578F82]" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                How Kuddl Compares
              </h2>
              <p className="text-gray-600">
                Lowest commission and fastest payouts in the industry.
              </p>
            </div>

            <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg overflow-hidden shadow-sm p-4 relative">
              <div className="absolute -right-8 -bottom-8 grid grid-cols-4 gap-2 opacity-20 z-0">
                {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 bg-gray-400 rounded-full" />)}
              </div>
              <div className="absolute -left-8 -top-8 grid grid-cols-4 gap-2 opacity-20 z-0">
                {[...Array(16)].map((_, i) => <div key={i} className="w-2 h-2 bg-[#CF956D] rounded-full" />)}
              </div>

              <div className="overflow-x-auto relative z-10 border-2 border-dashed border-gray-200">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-dashed border-gray-200">
                      <th className="p-4 font-bold text-xs text-gray-800">Platform</th>
                      <th className="p-4 font-bold text-xs text-gray-800 border-l-2 border-dashed border-gray-200">Partner<br />Commission</th>
                      <th className="p-4 font-bold text-xs text-gray-800 border-l-2 border-dashed border-gray-200">Platform Fee</th>
                      <th className="p-4 font-bold text-xs text-gray-800 border-l-2 border-dashed border-gray-200">Payouts</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-[#578F82]/10 border-b-2 border-dashed border-gray-200 relative">
                      <td className="p-4 font-bold text-xs text-[#578F82] relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CF956D]" />
                        Kuddl (Launch Rates)
                      </td>
                      <td className="p-4 font-bold text-xs text-[#578F82] border-l-2 border-dashed border-gray-200">10-15% by<br />category</td>
                      <td className="p-4 font-bold text-xs text-[#578F82] border-l-2 border-dashed border-gray-200">₹0 for founding<br />partners</td>
                      <td className="p-4 font-bold text-xs text-[#578F82] border-l-2 border-dashed border-gray-200">3-day express</td>
                    </tr>
                    <tr className="border-b-2 border-dashed border-gray-200">
                      <td className="p-4 text-xs text-gray-600">Urban Company</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">20-25%</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Varies</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Weekly</td>
                    </tr>
                    <tr className="border-b-2 border-dashed border-gray-200">
                      <td className="p-4 text-xs text-gray-600">ClassPass</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">~30-50%</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Varies</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Monthly</td>
                    </tr>
                    <tr className="border-b-2 border-dashed border-gray-200">
                      <td className="p-4 text-xs text-gray-600">Practo</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">15-20%</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">₹5,000+/mo</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Weekly</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-xs text-gray-600">Yes Madam /<br />Draoto</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">20-30%</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Varies</td>
                      <td className="p-4 text-xs text-gray-600 border-l-2 border-dashed border-gray-200">Weekly</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* SECTION C: REFER PARTNERS                         */}
        {/* ================================================ */}
        <section className="py-16 md:py-24 bg-[#FFF8F2] relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 xl:gap-24">

              <div className="hidden lg:flex flex-1 w-full max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] relative justify-center items-center order-2 lg:order-1 mx-auto lg:mx-0 py-8 md:py-0">
                <div className="relative w-full max-w-[400px] md:max-w-[500px]">
                  <img src={rewardImg} alt="Refer and Earn Rewards" className="w-full h-auto object-contain relative z-0" />

                  <div className="absolute left-[2%] md:left-[-12%] top-[50%] -translate-y-1/2 z-10">
                    <div className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-6 md:px-6 py-8 md:py-8 flex flex-col items-center min-w-[130px] md:min-w-[130px] border border-gray-100">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FFEAC2] flex items-center justify-center mb-4 md:mb-6">
                        <svg viewBox="0 0 24 24" fill="#2D2D2D" className="w-8 h-8 md:w-10 md:h-10">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        </svg>
                      </div>
                      <div className="text-[36px] md:text-[44px] font-bold text-[#578F82] leading-none mb-2" style={{ fontFamily: '"adineue PRO", sans-serif' }}>₹500</div>
                      <div className="text-[#888888] text-[14px] md:text-[16px] font-medium">Earnings</div>
                    </div>
                  </div>

                  <div className="absolute right-[2%] md:right-[-5%] bottom-[5%] md:bottom-[10%] z-10">
                    <div className="bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] px-5 md:px-7 py-4 md:py-5 flex flex-col items-center border border-gray-100">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-[28px] md:text-[34px] font-bold text-[#2D2D2D] leading-none" style={{ fontFamily: '"adineue PRO", sans-serif' }}>5000+</div>
                      </div>
                      <div className="text-[#888888] text-[14px] md:text-[15px] font-medium mt-1">Customers</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 order-1 lg:order-2 w-full max-w-[650px] mx-auto lg:mx-0">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <img src={kuddlLogoFull} alt="Kuddl" className="h-[32px] object-contain" />
                </div>

                <h2 className="pt-4 md:pt-0 text-[40px] md:text-[50px] lg:text-[56px] xl:text-[64px] font-medium text-[#2D2D2D] leading-[1.1] mb-6 tracking-tight" style={{ fontFamily: '"adineue PRO", sans-serif' }}>
                  Refer partners.<br />Earn rewards.
                </h2>

                <div className="relative mb-12 lg:mb-16">
                  <p className="text-[#555555] text-[15px] md:text-[16px] leading-[1.6] max-w-[540px] font-normal">
                    Know a great kids' music teacher, party planner, or physiotherapist? When they join and get their first booking, you earn rewards that grow your visibility on the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 w-full">
                  {[
                    { title: <>Boost<br />Credits</>,        subtitle: '',                       desc: 'Earn ₹500 in Kuddl Boost credits per successful referral — use them for priority placement in parent searches and featured homepage spots.', badge: 'Per referral' },
                    { title: <>Instagram<br />Spotlight</>,  subtitle: 'After 3 referrals',       desc: ", your profile gets a dedicated spotlight on Kuddl's Instagram and homepage — free marketing to thousands of parents in Delhi.", badge: 'For 3 referrals' },
                    { title: <>Priority<br />Placement</>,   subtitle: 'After 5 referrals',       desc: ", earn a permanent 'Top Partner' badge and priority listing in your category — your profile shows up first when parents search.",   badge: 'For 5 referrals' },
                  ].map((reward, i) => (
                    <div key={i} className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-full items-center text-center">
                      <h4 className="text-[#C69C7B] font-medium text-[18px] mb-3 leading-tight min-h-[54px] flex items-center">{reward.title}</h4>
                      <p className="text-[#666666] text-[13px] leading-[1.6] mb-auto">
                        {reward.subtitle && <span className="font-medium">{reward.subtitle}</span>}
                        {reward.desc}
                      </p>
                      <div className="mt-6 flex justify-center w-full">
                        <button className="bg-[#578F82] text-white text-[13px] font-medium px-6 py-2.5 rounded-[20px] hover:bg-[#4a7c70] transition-colors w-full md:w-auto">
                          {reward.badge}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

export default Pricing;
