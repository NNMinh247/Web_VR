import React, { useState, useEffect } from "react";
import "./Partners.css";

import { apiUrl, publicUrl } from "../../config/api";

const PartnerLogo = ({ partner }) => {
  const imgUrl = publicUrl(partner.logo_url);
  
  return (
    <a 
      href={partner.website_url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="partner-item"
    >
      <img 
        src={imgUrl} 
        alt={partner.name} 
        onError={(e) => {
           e.target.style.display = 'none';
           e.target.parentElement.innerText = partner.name; 
        }} 
      />
    </a>
  );
};

function Partners() {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    fetch(apiUrl("api/partners"))
      .then((res) => res.json())
      .then((data) => setPartners(data))
      .catch((err) => console.error(err));
  }, []);

  if (partners.length === 0) return null;

  const midPoint = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, midPoint);
  const row2 = partners.slice(midPoint);

  return (
    <div className="partners-section">
      <div className="partners-header">
        <span className="sub-title">ĐỐI TÁC</span>
        <h2>ĐỐI TÁC DOANH NGHIỆP</h2>
        <div className="line-red"></div>
      </div>

      <div className="partners-marquee-wrapper">
        
        <div className="marquee-track">
          <div className="marquee-content scroll-left">
            {row1.map((p) => <PartnerLogo key={p.id} partner={p} />)}
            {row1.map((p) => <PartnerLogo key={`dup-${p.id}`} partner={p} />)}
          </div>
        </div>

        <div className="marquee-track">
          <div className="marquee-content scroll-right">
            {row2.map((p) => <PartnerLogo key={p.id} partner={p} />)}
            {row2.map((p) => <PartnerLogo key={`dup-${p.id}`} partner={p} />)}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Partners;