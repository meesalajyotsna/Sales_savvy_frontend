import React from 'react';
import './assets/styles.css';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3 className="footer-title">SalesSavvy</h3>
          <p className="footer-tagline">Your one-stop shop for all your needs</p>
        </div>

        <div className="footer-center">
          <div className="social-icons">
            <a href="#" className="icon"><FaFacebookF /></a>
            <a href="#" className="icon"><FaTwitter /></a>
            <a href="#" className="icon"><FaInstagram /></a>
            <a href="#" className="icon"><FaLinkedinIn /></a>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-links">
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2023 SalesSavvy. All rights reserved.</p>
      </div>
    </footer>
  );
}
