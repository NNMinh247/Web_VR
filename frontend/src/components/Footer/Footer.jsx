import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-line"></div>

      <div className="footer-content">
        <div className="social-icons">
          <a 
            href="https://www.youtube.com/@HocvienCongngheBuuchinhVienthong" 
            target="_blank" 
            rel="noopener noreferrer"
            className="icon-link"
          >
            <i className="bi bi-youtube"></i>
          </a>

          <a 
            href="https://www.facebook.com/HocvienPTIT" 
            target="_blank" 
            rel="noopener noreferrer"
            className="icon-link"
          >
            <i className="bi bi-facebook"></i>
          </a>

          <a 
            href="mailto:tuyensinh@ptit.edu.vn" 
            className="icon-link"
          >
            <i className="bi bi-envelope-fill"></i>
          </a>
        </div>

        <div className="footer-copyright">
          <p>PTIT &copy; {new Date().getFullYear()} - Học viện Công nghệ Bưu chính Viễn thông</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;