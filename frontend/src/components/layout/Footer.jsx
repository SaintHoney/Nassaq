import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe } from 'lucide-react';
import axios from 'axios';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const Footer = () => {
  const { isRTL } = useTheme();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/contact-info`);
        setContactInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
        // Use defaults on error
        setContactInfo({
          primary_email: 'info@nassaqapp.com',
          support_email: 'support@nassaqapp.com',
          primary_phone: '+966 11 234 5678',
          address: 'الرياض، المملكة العربية السعودية',
          social_media: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Build social links from contact info
  const buildSocialLinks = () => {
    if (!contactInfo?.social_media) return [];
    
    const social = contactInfo.social_media;
    const links = [];
    
    if (social.twitter) links.push({ icon: Twitter, href: social.twitter.startsWith('http') ? social.twitter : `https://twitter.com/${social.twitter.replace('@', '')}`, label: 'Twitter' });
    if (social.linkedin) links.push({ icon: Linkedin, href: social.linkedin.startsWith('http') ? social.linkedin : `https://linkedin.com/company/${social.linkedin}`, label: 'LinkedIn' });
    if (social.facebook) links.push({ icon: Facebook, href: social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`, label: 'Facebook' });
    if (social.instagram) links.push({ icon: Instagram, href: social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`, label: 'Instagram' });
    if (social.youtube) links.push({ icon: Youtube, href: social.youtube.startsWith('http') ? social.youtube : `https://youtube.com/${social.youtube}`, label: 'YouTube' });
    
    // Fallback if no social links configured
    if (links.length === 0) {
      links.push({ icon: Twitter, href: '#', label: 'Twitter' });
      links.push({ icon: Linkedin, href: '#', label: 'LinkedIn' });
    }
    
    return links;
  };

  const socialLinks = buildSocialLinks();

  return (
    <footer data-testid="footer" className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src={LOGO_WHITE} alt="نَسَّق" className="h-12 w-auto rounded-xl" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed font-tajawal mb-6">
              {isRTL
                ? 'منصة متكاملة لإدارة المدارس مدعومة بالذكاء الاصطناعي، تقدم حلولاً ذكية للعملية التعليمية.'
                : 'AI-powered integrated school management platform, delivering smart solutions for education.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-brand-turquoise transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-cairo font-semibold text-lg mb-4">
              {isRTL ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-white/70 hover:text-brand-turquoise transition-colors text-sm font-tajawal"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-white/70 hover:text-brand-turquoise transition-colors text-sm font-tajawal"
                >
                  {isRTL ? 'تسجيل جديد' : 'Register'}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-brand-turquoise transition-colors text-sm font-tajawal"
                >
                  {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-brand-turquoise transition-colors text-sm font-tajawal"
                >
                  {isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-cairo font-semibold text-lg mb-4">
              {isRTL ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/70 text-sm font-tajawal">
                <Mail className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                <span data-testid="footer-email">{contactInfo?.primary_email || 'info@nassaqapp.com'}</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm font-tajawal">
                <Phone className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                <span dir="ltr" data-testid="footer-phone">{contactInfo?.primary_phone || '+966 11 234 5678'}</span>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm font-tajawal">
                <MapPin className="h-5 w-5 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <span data-testid="footer-address">
                  {contactInfo?.address || (isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia')}
                </span>
              </li>
              {contactInfo?.website && (
                <li className="flex items-center gap-3 text-white/70 text-sm font-tajawal">
                  <Globe className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                  <a 
                    href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-turquoise transition-colors"
                    data-testid="footer-website"
                  >
                    {contactInfo.website.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/70 text-sm font-tajawal mb-2" data-testid="footer-owner">
            © 2026 {contactInfo?.owner_name || 'NASSAQ'}. All rights reserved.
          </p>
          <p className="text-white/50 text-xs font-tajawal">
            {isRTL ? 'عنصر المستقبل - يوفاي في اس' : 'Future Element & UVAII VS'}
          </p>
        </div>
      </div>
    </footer>
  );
};
