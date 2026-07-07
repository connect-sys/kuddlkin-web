import React from 'react';
import { AlertTriangle, Shield, Phone, Mail, AlertCircle } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const ChildSafetyGuidelines: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Partner Child Safety Code</h1>
          </div>
          <p className="text-xl text-white/90">
            Version 1.0 | Effective: 1st January 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <div className="bg-[#FFF5EC] border-l-4 border-[#CF956D] p-6 rounded-lg mb-6">
              <p className="text-gray-700 leading-relaxed">
                At Kuddl, every child who comes into contact with our platform is someone's most precious person. This Code exists because we believe that child safety is not a compliance checkbox — it is the foundation of trust that makes Kuddl possible. As a Partner, you are the person in the room. This Code tells you exactly what we expect, what you must never do, and what to do if something goes wrong. <strong>Read it. Know it. Keep it.</strong>
              </p>
            </div>
          </section>

          {/* Zero Tolerance Warning */}
          <section className="mb-12">
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-red-900 mb-2">Zero Tolerance</h3>
                  <p className="text-red-800 leading-relaxed">
                    Any conduct that harms, exploits, endangers, or is sexually inappropriate towards a child will result in <strong>immediate removal</strong> from the Kuddl platform and <strong>mandatory reporting to law enforcement</strong>. There are no exceptions and no second chances.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 01 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Who This Code Is For and Why It Exists</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                This Child Safety Code applies to <strong>every person who provides services through the Kuddl platform</strong> — across every category (Care, Bloom, Adventure, and Discover) — regardless of whether your work involves extended child contact or a single interaction.
              </p>
              <p>
                Kuddl connects families with independent service providers. When a parent books through our platform, they are placing trust in us — and by extension, in you. That trust must be honoured.
              </p>
              <p>
                Kuddl operates as a marketplace and does not supervise individual service interactions. This makes your personal commitment to child safety even more important. <strong>You are the professional present in the moment. You set the standard.</strong>
              </p>
            </div>
          </section>

          {/* Section 02 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Your Core Obligations</h2>
            <p className="text-gray-700 mb-4">By registering as a Kuddl Partner, you commit to the following obligations in every interaction involving a child:</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Prioritise safety above all else.</strong> A child's physical safety, emotional wellbeing, and dignity must be your first consideration in every service interaction.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Maintain professional boundaries at all times.</strong> Your relationship with a child is professional. It must remain appropriate, respectful, and limited to what is necessary for the service being delivered.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Comply with all applicable child protection laws,</strong> including the Protection of Children from Sexual Offences Act, 2012 (POCSO) and the Juvenile Justice (Care and Protection of Children) Act, 2015.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Report immediately.</strong> If you witness, suspect, or become aware of any conduct that harms or endangers a child — including by yourself, another Partner, or any third party — you must report it. Immediately. Both to Kuddl and to the relevant authorities.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Cooperate fully</strong> with any investigation by Kuddl, law enforcement, or any child welfare authority in relation to a child safety matter.</span>
              </li>
            </ul>
          </section>

          {/* Section 03 - Do's and Don'ts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Do's and Don'ts — In Plain Terms</h2>
            <p className="text-gray-700 mb-6">The following table sets out what you must and must not do in every interaction with a child through the platform.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#578F82] text-white">
                    <th className="p-4 text-left font-bold border border-gray-300">YOU MUST</th>
                    <th className="p-4 text-left font-bold border border-gray-300">YOU MUST NOT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Treat every child with dignity, kindness, and respect.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never engage in any form of physical, emotional, or sexual contact with a child that is not within the agreed scope of your service.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Ensure a parent or guardian is present or reachable during in-home services.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never be alone with a child in a closed or private space unless the service explicitly requires it and the parent has consented.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Communicate with children in an age-appropriate, professional manner.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never make comments or engage in conduct of a sexual, romantic, or inappropriate nature towards a child or their family.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Get explicit written parental consent before photographing or recording a child for any purpose.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never photograph, record, or share images or videos of a child without explicit, documented parental consent.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Communicate with parents/guardians only through Kuddl's in-app chat or other Kuddl-approved channels.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never contact a child directly through personal messaging apps, social media, or any channel outside Kuddl's platform.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Immediately inform Kuddl if a parent or child discloses any form of harm or abuse to you.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never dismiss, minimise, or fail to act on a disclosure of harm or abuse made by a child or their family.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Maintain clear professional boundaries between your role as a service provider and your personal life.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never develop personal, social, or financial relationships with customers or their children outside the scope of your service.</td>
                  </tr>
                  <tr>
                    <td className="p-4 border border-gray-300 align-top">Report any concern about a child's welfare immediately — even if you are not certain.</td>
                    <td className="p-4 border border-gray-300 align-top bg-red-50">Never wait for certainty before reporting a welfare concern. Reporting in good faith is always the right action.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 04 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. What Is a Reportable Incident?</h2>
            <p className="text-gray-700 mb-6">You must report any of the following — whether you experienced it, witnessed it, or were told about it:</p>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-red-900 mb-3 text-lg">Mandatory Reports — Legal Obligation Under POCSO</h3>
              <ul className="space-y-2 text-red-800">
                <li className="flex gap-2"><span>•</span><span>Any act of sexual abuse, sexual assault, or sexual harassment of a child</span></li>
                <li className="flex gap-2"><span>•</span><span>Any grooming behaviour directed at a child by an adult</span></li>
                <li className="flex gap-2"><span>•</span><span>Any physical abuse, including hitting, restraint, or deliberate injury</span></li>
                <li className="flex gap-2"><span>•</span><span>Any exposure of a child to pornographic or sexually explicit material</span></li>
                <li className="flex gap-2"><span>•</span><span>Any sharing, production, or possession of child sexual abuse material</span></li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-yellow-900 mb-3 text-lg">Critical Legal Notice</h3>
              <p className="text-yellow-900 leading-relaxed">
                Under Section 21 of the Protection of Children from Sexual Offences Act, 2012 (POCSO), any person who has knowledge or reasonable suspicion that a child has been or is being sexually abused <strong>MUST report this to the police</strong>. Failure to report is a criminal offence punishable by up to six months' imprisonment. This is not optional. This obligation applies to you as a Kuddl Partner.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Operational Incidents — Report to Kuddl</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex gap-2"><span>•</span><span>Inappropriate conduct by any person (Partner, staff member, visitor) towards a child</span></li>
                <li className="flex gap-2"><span>•</span><span>A child appearing distressed, frightened, or exhibiting signs of harm</span></li>
                <li className="flex gap-2"><span>•</span><span>A disclosure by a child that they are experiencing harm at home or elsewhere</span></li>
                <li className="flex gap-2"><span>•</span><span>Any situation in which a child was left unsupervised in unsafe circumstances</span></li>
                <li className="flex gap-2"><span>•</span><span>Any concern about another Partner's conduct involving children, even if you are unsure</span></li>
              </ul>
            </div>
          </section>

          {/* Section 05 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. How to Report — Step by Step</h2>
            <p className="text-gray-700 mb-6">If you witness or suspect a child safety incident, follow these steps in order. Do not wait. Do not seek permission. Act immediately.</p>
            
            <div className="space-y-4">
              {[
                {
                  step: 'Step 1',
                  title: 'Ensure the child\'s immediate safety',
                  desc: 'If the child is in immediate physical danger, call 100 (Police) or 1098 (Childline India) first. Do not wait for guidance from Kuddl.'
                },
                {
                  step: 'Step 2',
                  title: 'Report to Kuddl immediately',
                  desc: 'Email connect@tendernest.world with subject line: CHILD SAFETY INCIDENT. Include: your name and partner ID, the booking ID, the date and location, a clear description of what happened or was observed, and the names of any persons involved.'
                },
                {
                  step: 'Step 3',
                  title: 'Preserve information',
                  desc: 'Do not delete any messages, screenshots, or records related to the incident. These may be required by Kuddl or law enforcement.'
                },
                {
                  step: 'Step 4',
                  title: 'If POCSO-triggering, report to police',
                  desc: 'If the incident involves sexual abuse, assault, or any POCSO-covered offence, you must also file a report with the local police station or Special Juvenile Police Unit (SJPU) without delay.'
                },
                {
                  step: 'Step 5',
                  title: 'Maintain confidentiality',
                  desc: 'Do not discuss the incident with other Partners, on social media, or with anyone other than Kuddl\'s team and the relevant authorities. Confidentiality protects the child.'
                }
              ].map((item, i) => (
                <div key={i} className="border-l-4 border-[#578F82] bg-gray-50 p-4 rounded-r-lg">
                  <div className="font-bold text-[#578F82] mb-1">{item.step}</div>
                  <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
                  <div className="text-gray-700 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-500 p-4 rounded-lg mt-6">
              <p className="text-green-900 font-medium">
                You will not face any penalty, loss of bookings, or adverse treatment for making a good-faith child safety report. Kuddl protects Partners who speak up.
              </p>
            </div>
          </section>

          {/* Section 06 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Special Rules for Care and Bloom Partners</h2>
            <p className="text-gray-700 mb-4">If you provide services in the Care or Bloom categories — including nannies, childcare providers, therapists, tutors, coaches, or developmental specialists — the following additional rules apply, given the extended and often in-home nature of your interactions with children.</p>
            
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Parental consent for any non-standard interaction.</strong> Any activity, exercise, or form of engagement not described in your listed service must be discussed with and agreed to by the parent or guardian in advance.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>No personal communications with children.</strong> All communications must go through the parent or guardian. You must not communicate directly with a child via any personal channel — including WhatsApp, Instagram, or SMS.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>No unsupervised transport of children.</strong> You must not transport a child in a personal vehicle or any unbooked mode of transport without explicit written parental consent for each journey.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Session observations.</strong> Parents and guardians have the right to be present during any session. You must accommodate this request.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">•</span>
                <span><strong>Record-keeping.</strong> If your service involves session notes or progress records (e.g., therapy or tutoring), share these only with the child's parent or guardian — never with another party without written parental consent.</span>
              </li>
            </ul>
          </section>

          {/* Section 07 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Consequences of Violation</h2>
            <p className="text-gray-700 mb-6">Kuddl enforces this Code strictly and without exception. The consequences below apply in addition to any legal liability you may face under Indian law.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="p-3 text-left font-bold border border-gray-300">VIOLATION</th>
                    <th className="p-3 text-left font-bold border border-gray-300">CONSEQUENCE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Any child safety incident</td>
                    <td className="p-3 border border-gray-300 align-top">Immediate suspension of platform access pending investigation. If substantiated: permanent removal from the platform.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Failure to report a POCSO-triggering incident</td>
                    <td className="p-3 border border-gray-300 align-top bg-red-50">Immediate termination of partnership. Reporting to the relevant authority. Potential exposure to criminal prosecution under POCSO §21.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Inappropriate conduct towards a child</td>
                    <td className="p-3 border border-gray-300 align-top">Immediate suspension pending review. Permanent removal if conduct is established. Reporting to law enforcement if conduct is criminal.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Photographing or recording a child without consent</td>
                    <td className="p-3 border border-gray-300 align-top">Immediate suspension pending investigation. Potential legal action.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Breach of confidentiality about a reported incident</td>
                    <td className="p-3 border border-gray-300 align-top">Termination of partnership. Potential legal action for contempt or interference with a child welfare investigation.</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-300 align-top font-semibold">Repeated minor boundary violations</td>
                    <td className="p-3 border border-gray-300 align-top">Formal warning followed by suspension. Permanent removal on recurrence.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 08 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Emergency Contacts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-red-600" />
                  <div className="font-bold text-red-900">Police</div>
                </div>
                <div className="text-2xl font-bold text-red-600 mb-1">100</div>
                <div className="text-sm text-red-800">Immediate danger to a child</div>
              </div>

              <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div className="font-bold text-orange-900">Childline India</div>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">1098</div>
                <div className="text-sm text-orange-800">Child welfare emergency — free, 24/7</div>
              </div>

              <div className="border-2 border-[#578F82] rounded-lg p-4 bg-[#578F82]/5 md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-[#578F82]" />
                  <div className="font-bold text-[#578F82]">Kuddl Child Safety</div>
                </div>
                <div className="text-lg font-bold text-[#578F82] mb-1">connect@tendernest.world</div>
                <div className="text-sm text-gray-700">Subject: CHILD SAFETY INCIDENT</div>
                <div className="text-xs text-gray-600 mt-1">Any incident involving a child on the platform</div>
              </div>

              <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div className="font-bold text-blue-900">National Cyber Crime</div>
                </div>
                <div className="text-lg font-bold text-blue-600 mb-1">cybercrime.gov.in</div>
                <div className="text-sm text-blue-800">Online child abuse material</div>
              </div>

              <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-3 mb-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div className="font-bold text-purple-900">SJPU (your district)</div>
                </div>
                <div className="text-lg font-bold text-purple-600 mb-1">Contact your local police station</div>
                <div className="text-sm text-purple-800">POCSO offences — mandatory report</div>
              </div>
            </div>
          </section>

          {/* Section 09 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Partner Acknowledgement</h2>
            <p className="text-gray-700 mb-4">By completing registration on the Kuddl Partner platform and ticking the acceptance checkbox during onboarding, you confirm that:</p>
            
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">✓</span>
                <span>You have read and understood this Partner Child Safety Code in full.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">✓</span>
                <span>You agree to comply with all obligations set out in this Code in every interaction involving a child.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">✓</span>
                <span>You understand that violations may result in immediate platform removal and referral to law enforcement.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">✓</span>
                <span>You acknowledge your mandatory reporting obligations under POCSO §21.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#578F82] font-bold flex-shrink-0">✓</span>
                <span>You understand that this Code forms part of your Partner Terms and Conditions with TENDERNEST (OPC) PRIVATE LIMITED.</span>
              </li>
            </ul>
          </section>

          {/* Final Note */}
          <section className="mb-12">
            <div className="bg-[#578f82]/10 border-l-4 border-[#578f82] p-6 rounded">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-[#578f82] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-800 font-semibold mb-2">A Note from Kuddl</p>
                  <p className="text-gray-700 leading-relaxed">
                    We know the vast majority of our Partners are people who genuinely care about children and families. This Code exists not to cast doubt on your intentions, but to give you clear, unambiguous guidance for the moments that matter most. <strong>When in doubt, report. When unsure, ask. The safety of a child always comes first.</strong> Thank you for being part of a platform built on trust.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information - Matching Terms Page Format */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>TENDERNEST (OPC) PRIVATE LIMITED</strong></p>
              <p className="text-gray-700 mb-2">CIN: U47912DL2025OPC452425</p>
              <p className="text-gray-700 mb-2">400-A, 4th Floor, 12 Ajit Singh House</p>
              <p className="text-gray-700 mb-2">Yusuf Sarai, Green Park</p>
              <p className="text-gray-700 mb-2">New Delhi, South West Delhi – 110016, Delhi</p>
              <p className="text-gray-700 mb-2">Email: connect@tendernest.world</p>
              <p className="text-gray-700">Website: www.kuddl.co</p>
            </div>
          </section>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default ChildSafetyGuidelines;
