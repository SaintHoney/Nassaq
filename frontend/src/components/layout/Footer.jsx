import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Mail, Phone, MapPin, Twitter, Linkedin } from 'lucide-react';

const LOGO_WHITE = 'https://customer-assets.emergentagent.com/job_f5ea20bb-5cf5-462f-a7f0-958201e27f89/artifacts/q04svb5j_Nassaq%20LinkedIn%20Logo%20White.png';

export const Footer = () => {
  const { isRTL } = useTheme();

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer data-testid="footer" className="bg-brand-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <img src={LOGO_WHITE} alt="نَسَّق" className="h-12 w-auto" />
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
                <span>info@nassaqapp.com</span>
              </li>
              <li className="flex items-center gap-3 text-white/70 text-sm font-tajawal">
                <Phone className="h-5 w-5 text-brand-turquoise flex-shrink-0" />
                <span dir="ltr">+966 50 000 0000</span>
              </li>
              <li className="flex items-start gap-3 text-white/70 text-sm font-tajawal">
                <MapPin className="h-5 w-5 text-brand-turquoise flex-shrink-0 mt-0.5" />
                <span>
                  {isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/50 text-sm font-tajawal">
            {isRTL
              ? '© 2026 نَسَّق. جميع الحقوق محفوظة.'
              : '© 2026 NASSAQ. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
