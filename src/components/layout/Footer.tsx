import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">FileMarket</h3>
            <p className="mb-4">
              The premier marketplace for digital files, templates, graphics, and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="inline-block hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="inline-block hover:text-white transition-colors">
                  Browse Files
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-block hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-block hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">File Types</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse/pdf" className="inline-block hover:text-white transition-colors">
                  PDF Files
                </Link>
              </li>
              <li>
                <Link to="/browse/word" className="inline-block hover:text-white transition-colors">
                  Word Documents
                </Link>
              </li>
              <li>
                <Link to="/browse/excel" className="inline-block hover:text-white transition-colors">
                  Excel Spreadsheets
                </Link>
              </li>
              <li>
                <Link to="/browse/powerpoint" className="inline-block hover:text-white transition-colors">
                  PowerPoint
                </Link>
              </li>
              <li>
                <Link to="/browse/images" className="inline-block hover:text-white transition-colors">
                  Images
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mt-1 mr-2 flex-shrink-0" />
                <span>123 Market Street, Suite 456, New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span>+1 234 567 8910</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <span>info@filemarket.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} FileMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;