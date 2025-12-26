import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import "./Achievements.css";
import PlaceholderImg from "../../assets/images/slider/slider1.jpg"; 
import { apiUrl, publicUrl } from "../../config/api";

function Achievements() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(apiUrl("api/achievements"))
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Lỗi tải achievements:", err));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="achievements-container">
      <div className="section-header-wrapper">
        <h2 className="section-title-achieve">THÀNH TỰU NỔI BẬT</h2>
        <div className="header-line"></div>
      </div>

      <div className="achievements-grid">
        {items.map((item) => (
          <div key={item.id} className="achievement-card">
            <div className="card-image-box">
              <img 
                src={item.image_url ? publicUrl(item.image_url) : PlaceholderImg} 
                alt="Achievement"
                className="achievement-img"
                onError={(e) => e.target.src = PlaceholderImg} 
              />
              <div className="img-overlay"></div>
            </div>

            <div className="card-content">
              <div className="achievement-number">
                <span className="prefix">{item.prefix}</span>
                <span className="val">
                  <CountUp 
                    end={item.number_val} 
                    duration={3} 
                    enableScrollSpy={true} 
                    scrollSpyOnce={true} 
                  />
                </span>
                <span className="suffix">{item.suffix}</span>
              </div>
              
              <p className="achievement-desc">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;