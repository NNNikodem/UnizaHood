import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ImageModal from "./common/ImageModal"; // Import ImageModal komponentu
import "../CSS/Carousel.css";

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Nový stav pre modal

  const goToNext = () => {
    if (isTransitioning || images.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    if (isTransitioning || images.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // Support for touch swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      goToNext();
    }

    if (touchStart - touchEnd < -100) {
      goToPrev();
    }
  };

  // Funkcie pre otvorenie a zatvorenie ImageModal
  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  // Reset transition flag after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-track">
        <div className="carousel-slide">
          <img
            src={`http://localhost:5000${images[currentIndex]}`}
            alt={`Event image ${currentIndex + 1}`}
            className={`carousel-image ${
              isTransitioning ? "transitioning" : ""
            }`}
            onClick={openImageModal} // Pridaný onClick handler
            style={{ cursor: "pointer" }} // Kurzor ukazujúci, že je klikateľný
            title="Kliknutím zobrazíte v plnej veľkosti"
          />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            className="carousel-btn prev-btn"
            onClick={goToPrev}
            disabled={isTransitioning}
            aria-label="Previous image"
          >
            <FaChevronLeft />
          </button>

          <button
            className="carousel-btn next-btn"
            onClick={goToNext}
            disabled={isTransitioning}
            aria-label="Next image"
          >
            <FaChevronRight />
          </button>

          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                  }
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Pridané zobrazenie ImageModal */}
      {isImageModalOpen && (
        <ImageModal
          imageUrl={`http://localhost:5000${images[currentIndex]}`}
          alt={`Event image ${currentIndex + 1} full size`}
          onClose={closeImageModal}
        />
      )}
    </div>
  );
};

export default Carousel;
