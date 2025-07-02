import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Apple, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">FoodieExpress</h3>
            <p className="text-gray-300 mb-4">
              Delivering happiness, one meal at a time. Order from your favorite restaurants and get fresh food delivered fast.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Restaurants</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Partner with Us</a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
              </li>
            </ul>
          </div>
          
          {/* Download App */}
          <div>
            <h4 className="font-semibold mb-4">Download App</h4>
            <p className="text-gray-300 mb-4">Get the best experience with our mobile app</p>
            <div className="space-y-3">
              <a 
                href="#" 
                className="flex items-center bg-gray-700 rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors"
              >
                <Apple className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <p className="text-xs text-gray-300">Download on the</p>
                  <p className="font-semibold">App Store</p>
                </div>
              </a>
              <a 
                href="#" 
                className="flex items-center bg-gray-700 rounded-lg px-4 py-3 hover:bg-gray-600 transition-colors"
              >
                <Smartphone className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <p className="text-xs text-gray-300">Get it on</p>
                  <p className="font-semibold">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-600 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-center md:text-left">
              &copy; 2024 FoodieExpress. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
