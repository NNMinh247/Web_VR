import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Slider.css";
import Slider1 from "../../assets/images/slider/slider1.jpg"; 
import { apiUrl, publicUrl } from "../../config/api";

function Slider() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next"); 
  const [loading, setLoading] = useState(true);

  const pointerStartX = useRef(0);
  const pointerLastX = useRef(0);
  const isPointerDown = useRef(false);
  const activePointerId = useRef(null);

  useEffect(() => {
    fetch(apiUrl("api/intro"))
      .then((res) => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then((data) => {
        if (data.length > 0) {
          setSlides(data);
        } else {
          setSlides([
             { title: "HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG", description: "Cơ sở Giáo dục Đại học trọng điểm Quốc gia về Kỹ thuật, Công nghệ.", image_url: "" }
          ]);
        }
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  const changeSlide = useCallback((dir) => {
    if (animating || slides.length <= 1) return;

    setDirection(dir);
    setAnimating(true);

    window.setTimeout(() => {
      setIndex((prev) => {
        if (dir === "next") return (prev + 1) % slides.length;
        return (prev - 1 + slides.length) % slides.length;
      });
      setAnimating(false);
    }, 800);
  }, [animating, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      if (!animating) {
        changeSlide("next");
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [slides.length, index, animating, changeSlide]); 

  const minSwipeDistance = 50; 
  const handlePointerDown = (e) => {
    if (typeof e.button === "number" && e.button !== 0) return;
    isPointerDown.current = true;
    activePointerId.current = e.pointerId;
    pointerStartX.current = e.clientX;
    pointerLastX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown.current) return;
    if (activePointerId.current !== e.pointerId) return;
    pointerLastX.current = e.clientX;
  };

  const finishPointerGesture = (e) => {
    if (!isPointerDown.current) return;
    if (activePointerId.current !== e.pointerId) return;

    const distance = pointerStartX.current - pointerLastX.current;
    if (distance > minSwipeDistance) {
      changeSlide("next");
    } else if (distance < -minSwipeDistance) {
      changeSlide("prev");
    }

    isPointerDown.current = false;
    activePointerId.current = null;
    pointerStartX.current = 0;
    pointerLastX.current = 0;
  };

  if (loading) return <div className="slider-loading"></div>;
  if (slides.length === 0) return null;

  const currentSlide = slides[index];
  
  let nextSlideIndex;
  if (direction === "next") {
    nextSlideIndex = (index + 1) % slides.length;
  } else {
    nextSlideIndex = (index - 1 + slides.length) % slides.length;
  }
  const nextSlideData = slides[nextSlideIndex];

  const getImg = (slide) => slide.image_url ? publicUrl(slide.image_url) : Slider1;

  return (
    <div 
      className="movie-slider"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerGesture}
      onPointerCancel={finishPointerGesture}
      onPointerLeave={(e) => {
        if (isPointerDown.current) finishPointerGesture(e);
      }}
    >
      <div className="slider-img-wrapper">
        <img 
          src={getImg(currentSlide)} 
          alt="slider" 
          className="slider-img"
          onError={(e) => e.target.src = Slider1} 
        />
        
        <div className="overlay-gradient"></div>

        <div className="slider-text-wrapper">
          
          <div
            key={`active-${index}`}
            className={`slider-content ${animating ? (direction === "next" ? "slide-out-left" : "slide-out-right") : "active"}`}
          >
            <h1 className="slider-main-title">{currentSlide.title}</h1>
            <div className="slider-divider"></div>
            <p className="slider-desc">{currentSlide.description}</p>
          </div>

          <div
            key={`incoming-${nextSlideIndex}-${direction}`}
            className={`slider-content incoming ${direction} ${animating ? "slide-in" : ""}`}
          >
            <h1 className="slider-main-title">{nextSlideData.title}</h1>
            <div className="slider-divider"></div>
            <p className="slider-desc">{nextSlideData.description}</p>
          </div>

        </div>
        
      </div>
    </div>
  );
}

export default Slider;