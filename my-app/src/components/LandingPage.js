import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import './LandingPage.css';

const LandingPage = () => {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [activeVideo, setActiveVideo] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1); // Start at 1 (first real card)
  const carouselRef = useRef(null);
  const lenisRef = useRef(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  // Preload all expert images to prevent black screen
  useEffect(() => {
    const imageUrls = ['/expert1.jpg', '/expert2.jpg', '/expert3.jpg', '/expert4.jpg', '/expert5.jpg'];

    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Handle infinite scroll reset logic
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleTransitionEnd = () => {
      if (currentSlide === 6) { // After last clone
        carousel.style.transition = 'none';
        setCurrentSlide(1);
        setTimeout(() => {
          carousel.style.transition = 'transform 0.5s ease';
        }, 50);
      } else if (currentSlide === 0) { // After first clone
        carousel.style.transition = 'none';
        setCurrentSlide(5);
        setTimeout(() => {
          carousel.style.transition = 'transform 0.5s ease';
        }, 50);
      }
    };

    carousel.addEventListener('transitionend', handleTransitionEnd);
    return () => carousel.removeEventListener('transitionend', handleTransitionEnd);
  }, [currentSlide]);

  useEffect(() => {
    // Handle crossfade video looping
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (video1 && video2) {
      const fadeTransition = (currentVideo, nextVideo, nextVideoNumber) => {
        if (isTransitioning) return; // Prevent overlapping transitions

        setIsTransitioning(true);

        // Start the next video slightly before beginning fade
        nextVideo.currentTime = 0;
        nextVideo.play().catch(console.error);

        // Crossfade where incoming video fades in first, then outgoing fades out
        setTimeout(() => {
          // Start fading in the next video while current stays at full opacity
          nextVideo.style.opacity = '1';
          nextVideo.style.filter = 'blur(0px)';

          // After next video is fully visible, fade out current video
          setTimeout(() => {
            currentVideo.style.opacity = '0';
            currentVideo.style.filter = 'blur(1px)';
          }, 500); // Wait for incoming video to be fully visible
        }, 100);

        // Update active video state
        setActiveVideo(nextVideoNumber);

        // Reset current video and transition state after fade completes
        setTimeout(() => {
          currentVideo.currentTime = 0;
          currentVideo.style.filter = 'blur(0px)'; // Reset filter
          setIsTransitioning(false);
        }, 1100); // Match sequential transition timing (500ms + 500ms + buffer)
      };

      const handleVideo1TimeUpdate = () => {
        if (!isTransitioning && video1.duration - video1.currentTime < 3) { // Start fade 3 seconds before end
          fadeTransition(video1, video2, 2);
        }
      };

      const handleVideo2TimeUpdate = () => {
        if (!isTransitioning && video2.duration - video2.currentTime < 3) { // Start fade 3 seconds before end
          fadeTransition(video2, video1, 1);
        }
      };

      const handleVideo1Load = () => {
        video1.currentTime = 0;
        if (activeVideo === 1) {
          video1.play().catch(console.error);
        }
      };

      const handleVideo2Load = () => {
        video2.currentTime = 0;
        // Video 2 starts hidden
        video2.style.opacity = '0';
      };

      video1.addEventListener('timeupdate', handleVideo1TimeUpdate);
      video2.addEventListener('timeupdate', handleVideo2TimeUpdate);
      video1.addEventListener('loadeddata', handleVideo1Load);
      video2.addEventListener('loadeddata', handleVideo2Load);

      // Initialize first video
      if (video1.readyState >= 3) {
        video1.play().catch(console.error);
      }

      return () => {
        video1.removeEventListener('timeupdate', handleVideo1TimeUpdate);
        video2.removeEventListener('timeupdate', handleVideo2TimeUpdate);
        video1.removeEventListener('loadeddata', handleVideo1Load);
        video2.removeEventListener('loadeddata', handleVideo2Load);
      };
    }
  }, [activeVideo, isTransitioning]);

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      normalizeWheel: true,
      wheelMultiplier: 1,
      syncTouch: false,
      syncTouchLerp: 0.1,
      __experimental__naiveDimensions: false
    });

    lenisRef.current = lenis;

    // Backdrop image is now loaded via img element in HTML

    // Initialize wealth approach title for animation
    const wealthApproachTitle = document.querySelector('.wealth-approach-title');
    if (wealthApproachTitle) {
      wealthApproachTitle.style.opacity = '0';
      wealthApproachTitle.style.transform = 'translateY(-100px)'; // Start higher to end at -20px
    }



    const handleScroll = (time) => {
      const scrollY = lenis.scroll;
      const header = document.querySelector('.header');
      const videoOverlay = document.querySelector('.video-overlay');
      const heroSection = document.querySelector('.hero');
      const downloadWidget = document.querySelector('.download-widget');
      const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;


      // Calculate opacity based on scroll position relative to hero height
      const scrollProgress = Math.min(scrollY / (heroHeight * 0.8), 1);
      const tintOpacity = scrollProgress * 0.6; // Max 60% additional tint

      // Show/hide download widget based on scroll position
      if (downloadWidget) {
        if (scrollY > heroHeight * 0.8) {
          downloadWidget.classList.add('visible');
        } else {
          downloadWidget.classList.remove('visible');
        }
      }

      if (scrollY > 50) {
        header.classList.add('scrolled');

        // Check if we've scrolled past the video section
        if (scrollY >= heroHeight) {
          // Past video section - add black bar to header
          header.classList.add('past-video');
          if (videoOverlay) {
            videoOverlay.style.setProperty('--scroll-tint-opacity', 0.6); // Keep max tint
          }
        } else {
          // Still in video section - progressive tint on video only
          header.classList.remove('past-video');
          if (videoOverlay) {
            videoOverlay.style.setProperty('--scroll-tint-opacity', tintOpacity);
          }
        }
      } else {
        header.classList.remove('scrolled');
        header.classList.remove('past-video');
        if (videoOverlay) {
          videoOverlay.style.setProperty('--scroll-tint-opacity', 0);
        }
      }

      // Combined backdrop and founder logic (no white blip)
      const backdropSection = document.querySelector('.backdrop-section');
      const backdropImage = document.querySelector('.backdrop-image');
      const backdropContent = document.querySelector('.backdrop-content');
      const wealthInsightsSection = document.querySelector('.wealth-insights');
      const wealthApproachSection = document.querySelector('.wealth-approach-section');
      const processCardsSection = document.querySelector('.process-cards-section');
      const founderSection = document.querySelector('.founder-section');
      const founderImage = document.querySelector('.founder-image');
      const founderContent = document.querySelector('.founder-content');

      if (backdropSection && backdropImage && heroSection && wealthInsightsSection && wealthApproachSection && processCardsSection && founderSection && founderImage) {
        const heroTop = heroSection.offsetTop;
        const backdropTop = backdropSection.offsetTop;
        const backdropHeight = backdropSection.offsetHeight;
        const backdropBottom = backdropTop + backdropHeight;
        const wealthApproachTop = wealthApproachSection.offsetTop;
        const processCardsTop = processCardsSection.offsetTop;
        const processCardsHeight = processCardsSection.offsetHeight;
        const processCardsBottom = processCardsTop + processCardsHeight;
        const founderTop = founderSection.offsetTop;
        const founderHeight = founderSection.offsetHeight;
        const founderBottom = founderTop + founderHeight;

        // Lift up effect: cards section reveals founder background from bottom to top
        const processCardsElement = document.querySelector('.process-cards-section');

        // Lenis-style scroll: backdrop scrolls out, founder scrolls in from below

        // Reset cards position
        if (processCardsElement) {
          processCardsElement.style.transform = 'translateY(0px)';
        }

        // Lenis-style: Both backgrounds part of scroll system

        if (scrollY < wealthApproachTop) {
          // Before distinctive approach: backdrop visible with parallax
          const totalDistance = wealthApproachTop - heroTop;
          const scrollProgress = (scrollY - heroTop) / totalDistance;
          const imageParallaxOffset = scrollProgress * 100;

          // Backdrop visible and scrolling normally
          backdropImage.style.opacity = '1';
          backdropImage.style.transform = `translateY(-${imageParallaxOffset}px) scale(1.0)`;

          // Founder completely hidden before distinctive approach
          founderImage.style.opacity = '0';
          founderImage.style.transform = 'translateY(100vh)';

          // Founder content completely hidden before distinctive approach - aggressive hiding
          if (founderContent) {
            founderContent.style.opacity = '0';
            founderContent.style.visibility = 'hidden';
            founderContent.style.display = 'none';
          }

          // Show backdrop content when in backdrop section
          if (backdropContent) {
            if (scrollY >= backdropTop - window.innerHeight && scrollY < backdropBottom) {
              const contentProgress = (scrollY - backdropTop + window.innerHeight) / (backdropHeight + window.innerHeight);
              const textParallaxOffset = contentProgress * 30;
              backdropContent.style.opacity = '1';
              backdropContent.style.transform = `translateY(-200px) translateY(-${textParallaxOffset}px)`;
            } else {
              backdropContent.style.opacity = '0';
              backdropContent.style.transform = 'translateY(-200px)';
            }
          }
        }
        else {
          // From distinctive approach onwards: Founder background replaces backdrop completely
          const scrollThroughDistinctive = scrollY - wealthApproachTop;
          const distinctiveTotalHeight = wealthApproachSection.offsetHeight + processCardsHeight;
          const scrollProgress = Math.min(scrollThroughDistinctive / distinctiveTotalHeight, 1);

          // Hide backdrop immediately when cards section starts - no flash
          backdropImage.style.opacity = '0';
          backdropImage.style.transform = `translateY(-${window.innerHeight}px) scale(1.0)`;

          if (backdropContent) {
            backdropContent.style.opacity = '0';
            backdropContent.style.transform = 'translateY(-150px)';
          }

          // Get the wealth approach title element
          const wealthApproachTitle = document.querySelector('.wealth-approach-title');

          // Founder background stays fixed throughout
          founderImage.style.opacity = '1';
          founderImage.style.position = 'fixed';
          founderImage.style.top = '0px';
          founderImage.style.left = '0px';
          founderImage.style.width = '100vw';
          founderImage.style.height = '100vh';
          founderImage.style.transform = 'translateY(0px)';
          founderImage.style.zIndex = '1';

          // Cards behavior
          if (scrollProgress < 0.7) {
            // Keep cards in normal position during sticky phase
            if (wealthApproachTitle) {
              wealthApproachTitle.style.transform = 'translateY(-20px)';
            }
            if (processCardsElement) {
              processCardsElement.style.transform = 'translateY(0px)';
            }
          } else {
            // Cards lift up dramatically
            const liftProgress = (scrollProgress - 0.7) / 0.3;
            const liftAmount = liftProgress * window.innerHeight * 1.5;

            if (wealthApproachTitle) {
              wealthApproachTitle.style.transform = `translateY(-${liftAmount + 20}px)`;
            }
            if (processCardsElement) {
              processCardsElement.style.transform = `translateY(-${liftAmount}px)`;
            }
          }
        }

        // Founder content positioning - ALWAYS fixed, never transitions
        if (founderContent && scrollY >= wealthApproachTop) {
          founderContent.style.position = 'fixed';
          founderContent.style.top = '0px';
          founderContent.style.left = '0px';
          founderContent.style.width = '100vw';
          founderContent.style.height = '100vh';
          founderContent.style.transform = 'translateY(0px)';
          founderContent.style.zIndex = '2';
          founderContent.style.opacity = '1';
          founderContent.style.visibility = 'visible';
          founderContent.style.display = 'flex';
        }
      }

      // Wealth approach section parallax effect with fade-in
      const wealthApproachTitle = document.querySelector('.wealth-approach-title');

      if (wealthApproachSection && wealthApproachTitle) {
        const wealthApproachTop = wealthApproachSection.offsetTop;
        const viewportBottom = scrollY + window.innerHeight;

        // Start animation when section top reaches bottom of viewport
        if (viewportBottom >= wealthApproachTop) {
          // Calculate progress from when section first appears at bottom of screen
          const distanceFromBottom = viewportBottom - wealthApproachTop;
          const scrollProgress = Math.max(0, Math.min(1, distanceFromBottom / (window.innerHeight * 0.6)));

          // Parallax movement from above (starts 100px above, moves to -20px)
          const parallaxOffset = 100 - (scrollProgress * 80); // Moves from -100px to -20px

          // Fade in effect (0 to 1 opacity)
          const fadeOpacity = scrollProgress;

          wealthApproachTitle.style.transform = `translateY(-${parallaxOffset}px)`;
          wealthApproachTitle.style.opacity = fadeOpacity;
        } else {
          // Reset to initial state when section hasn't reached bottom of viewport yet
          wealthApproachTitle.style.transform = 'translateY(-100px)';
          wealthApproachTitle.style.opacity = '0';
        }
      }



    };

    // Add Lenis class to html element
    document.documentElement.classList.add('lenis');

    // Add scroll limits to prevent bouncing above hero section
    lenis.on('scroll', (e) => {
      // Prevent scrolling above 0 (top of page)
      if (e.scroll < 0) {
        lenis.scrollTo(0, { immediate: true });
        return;
      }
      handleScroll(e);
    });

    // Additional scroll limit enforcement
    const enforceScrollLimits = () => {
      if (lenis.scroll < 0) {
        lenis.scrollTo(0, { immediate: true });
      }
    };

    // Check scroll limits on wheel and touch events
    window.addEventListener('wheel', enforceScrollLimits, { passive: true });
    window.addEventListener('touchmove', enforceScrollLimits, { passive: true });

    // Animation frame for Lenis
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      window.removeEventListener('wheel', enforceScrollLimits);
      window.removeEventListener('touchmove', enforceScrollLimits);
      lenis.destroy();
    };
  }, []);
  return (
    <div className="landing-page">
      {/* Header/Navigation */}
      <header className="header">
        <nav className="navbar">
          <div className="nav-brand">
            <img src="/logo.svg" alt="Investza" className="logo" />
          </div>
          <ul className="nav-menu">
            <li><a href="#events">Events</a></li>
            <li><a href="#teams">Teams</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
          <div className="nav-cta">
            <button className="nav-button">Review my Portfolio</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-video">
          <video
            ref={video1Ref}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="background-video video-1"
            poster="/mountain-poster.jpg"
          >
            <source src="/hero_vid.mp4" type="video/mp4" />
          </video>
          <video
            ref={video2Ref}
            muted
            playsInline
            preload="auto"
            className="background-video video-2"
            poster="/mountain-poster.jpg"
          >
            <source src="/hero_vid.mp4" type="video/mp4" />
          </video>
          <div className="background-image-fallback"></div>
        </div>
        <div className="video-overlay"></div>
        <div className="hero-content">
          <h2 className="hero-text-above">Navigating the world of</h2>
          <h1 className="hero-main-word">Investments</h1>
          <h2 className="hero-text-below">with Tailored Strategies</h2>

          <div className="hero-buttons">
            <button className="cta-button single">Schedule a Call</button>
          </div>
        </div>
      </section>



      {/* Wealth Insights Section */}
      <section className="wealth-insights">
        <div className="container">
          <h2 className="insights-title">Wealth Insights from Experts.</h2>

          <div className="insights-carousel">
            <button className="carousel-arrow left-arrow" onClick={prevSlide}>
              <span>‹</span>
            </button>

            <div className="carousel-viewport">
              <div
                ref={carouselRef}
                className="insights-cards"
                style={{ transform: `translateX(-${currentSlide * 612}px)` }}
              >

                {/* Clone of last card for seamless backward scroll */}
                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert5.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"Value investing never goes out of style"</p>
                    <h3 className="expert-name">Prashant Jain</h3>
                    <p className="expert-title">Former CIO, HDFC Asset Management</p>
                  </div>
                </div>

                {/* Original cards */}
                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert1.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"Equity is always a no brainer."</p>
                    <h3 className="expert-name">Aashish Sommaiyaa</h3>
                    <p className="expert-title">ED & CEO, Whiteosk capital management</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert2.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"I feel blessed that I'm helping so many people build financial independence"</p>
                    <h3 className="expert-name">Kalpen Parekh</h3>
                    <p className="expert-title">CEO & MD at DSP mutual funds</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert3.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"When you are 25, your greatest asset cannot be fanancial because you don't have wealth"</p>
                    <h3 className="expert-name">Radhika Gupta</h3>
                    <p className="expert-title">MD & CEO, Edelweiss Asset Management</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert4.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"What is important is to keep going on...."</p>
                    <h3 className="expert-name">Sanjay Choudhary</h3>
                    <p className="expert-title">Founder & CEO at Incuspaze</p>
                  </div>
                </div>

                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert5.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"Money has so much importance in your life but money should not drive one person"</p>
                    <h3 className="expert-name">Vijai Mantri</h3>
                    <p className="expert-title">Co-Founder & Chief Investment Strategist at JRL Money</p>
                  </div>
                </div>

                {/* Clone of first card for seamless forward scroll */}
                <div className="insight-card">
                  <div className="expert-image">
                    <video
                      src="/expert1.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="expert-video"
                    />
                  </div>
                  <div className="insight-content">
                    <p className="insight-quote">"Equity is always a no brainer."</p>
                    <h3 className="expert-name">Aashish Sommaiyaa</h3>
                    <p className="expert-title">ED & CEO, Whiteosk capital management</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="carousel-arrow right-arrow" onClick={nextSlide}>
              <span>›</span>
            </button>
          </div>

          <div className="carousel-dots">
            {[1, 2, 3, 4, 5].map((index) => (
              <span
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>

          <div className="insights-footer">
            <button className="view-episodes-btn">View All Episodes <span className="arrow-circle">→</span></button>
          </div>

          {/* Statistics Section */}
          <div className="statistics-section">
            <div className="stats-header">
              <h2>MORE THAN 50% MUTUAL FUND</h2>
              <h2>INVESTORS DON'T BEAT NIFTY50 RETURNS IN THE LONG RUN</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,3H21V5H19V19A2,2 0 0,1 17,21H7A2,2 0 0,1 5,19V5H3V3M7,5V19H17V5H7M9,7H15V9H9V7M9,11H15V13H9V11M9,15H15V17H9V15Z" />
                  </svg>
                </div>
                <p>Higher Exposure to Thematic Funds/High Allocation to Exciting Themes</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
                  </svg>
                </div>
                <p>Risk Averse and Under-diversified</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z" />
                  </svg>
                </div>
                <p>Focused on timing of investments and fund selection rather than asset allocation</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7.07,18.28C7.5,17.38 8.12,16.5 8.91,15.77L10.32,17.18C9.75,17.96 9.29,18.81 8.95,19.72L7.07,18.28M9.5,10.5C9.5,11.19 9.81,11.8 10.31,12.19L9.5,14C8.47,13.39 7.75,12.24 7.75,10.95C7.75,9.66 8.47,8.5 9.5,7.89V10.5M12,4.75C14.9,4.75 17.25,7.1 17.25,10C17.25,12.9 14.9,15.25 12,15.25C9.1,15.25 6.75,12.9 6.75,10C6.75,7.1 9.1,4.75 12,4.75Z" />
                  </svg>
                </div>
                <p>Not having a reliable advisor, financial planner or mutual fund distributor with expertise</p>
              </div>
            </div>

            <div className="stats-learn-section">
              <button className="learn-why-btn">
                Learn Why
                <div className="learn-arrow-circle">→</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why INVESTZA Section */}
      <section className="why-investza">
        <div className="container">
          <div className="why-investza-content">
            <div className="why-investza-left">
              <h2>Why INVESTZA?</h2>
            </div>
            <div className="why-investza-right">
              <p className="why-subtitle">We don't believe in a one-size-fits-all.</p>
              <p className="why-description">We believe wealth management should be unique to you</p>
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="feature-cards-section">
            <div className="feature-cards-grid">
              <div className="feature-card">
                <h3>Personalized Strategies</h3>
                <p>We plan investment strategies around your goals, risk appetite and timeline — no generic market trends, no pre-set models.</p>
              </div>

              <div className="feature-card">
                <h3>Backed by Institutional Grade Research</h3>
                <p>Our team combines financial expertise with data-backed insights allowing you to make smarter and more confident decisions</p>
              </div>

              <div className="feature-card">
                <h3>Transparency & Trust at Every Step</h3>
                <p>No hidden agendas or complicated jargon. Just honest advice, full visibility, and a partnership built on trust.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Backdrop Section */}
      <section className="backdrop-section">
        <div className="backdrop-container">
          <div className="backdrop-image">
            <img src="/backdrop1.png" alt="Backdrop" />
          </div>
          <div className="backdrop-content">
            <div className="backdrop-stats">
              <div className="backdrop-stat-item">
                <div className="backdrop-stat-number">500 +</div>
                <div className="backdrop-stat-label">Clients</div>
              </div>
              <div className="backdrop-stat-item">
                <div className="backdrop-stat-number">200CR +</div>
                <div className="backdrop-stat-label">Assets Managed</div>
              </div>
              <div className="backdrop-stat-item">
                <div className="backdrop-stat-number">2CR +</div>
                <div className="backdrop-stat-label">Live SIP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wealth Creation Approach Section */}
      <section className="wealth-approach-section">
        <div className="wealth-approach-content">
          <h2 className="wealth-approach-title">Our Distinctive Approach to Wealth Creation</h2>
        </div>
      </section>

      {/* Process Cards Section */}
      <section className="process-cards-section">
        <div className="container">
          <div className="process-cards-grid">
            <div className="process-card">
              <div className="process-card-content">
                <div className="process-number">01</div>
                <div className="process-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                  </svg>
                </div>
                <h3 className="process-title">Defining the Objective</h3>
                <p className="process-description">We understand the entire picture and define a clear financial objective establishing the foundation of your investment strategy.</p>
              </div>
            </div>

            <div className="process-card">
              <div className="process-card-content">
                <div className="process-number">02</div>
                <div className="process-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,21L10.91,14.74L2,14L10.91,13.26L12,7L13.09,13.26L22,14L13.09,14.74L12,21Z" />
                  </svg>
                </div>
                <h3 className="process-title">Strategic Planning</h3>
                <p className="process-description">With institutional grade research, we plan a custom strategy integrating optimized asset allocation and intelligent diversification meant only for you.</p>
              </div>
            </div>

            <div className="process-card">
              <div className="process-card-content">
                <div className="process-number">03</div>
                <div className="process-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
                  </svg>
                </div>
                <h3 className="process-title">Implementing the Strategy</h3>
                <p className="process-description">Your customized strategy is deployed seamlessly using suitable instruments and platforms with precision, absolute clarity and efficiency.</p>
              </div>
            </div>

            <div className="process-card">
              <div className="process-card-content">
                <div className="process-number">04</div>
                <div className="process-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V12.41L15.36,14.95L16.64,12.59L13,10.59V6H11Z" />
                  </svg>
                </div>
                <h3 className="process-title">Consistent Monitoring</h3>
                <p className="process-description">We consistently monitor your portfolio and make prompt adjustments to ensure your investments stay aligned, tax efficient and on track.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="founder-section">
        <div className="founder-container">
          <div className="founder-image">
            <img src="/founder_bg.jpeg" alt="Founder Background" />
          </div>
          <div className="founder-content">
            <div className="founder-text">
              <blockquote className="founder-quote">
                "At Investza, our mission is simple — to make wealth creation less intimidating and more accessible. We're here to cut through the noise, offer real guidance, and help you build a financial future that's truly yours."
              </blockquote>
            </div>
            <div className="founder-profile">
              <div className="founder-profile-image">
                <img src="/abhishek_prof.png" alt="Abhishek Mehta" />
              </div>
              <h3 className="founder-name">Abhishek Mehta</h3>
              <p className="founder-title">Founder & Chief Strategist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lenis Cards Section */}
      <section className="lenis-cards-section">
        <div className="lenis-cards-container">
          <div className="lenis-layout">
            <div className="lenis-left">
              <h2>How Investza can help you grow your portfolio</h2>
              <p>Your financial journey doesn't just end with investing — it's supposed to evolve.</p>
            </div>

            <div className="lenis-right">
              <div className="lenis-cards-wrapper">
                <div className="lenis-card" data-card="1">
                  <div className="card-content">
                    <h3>Wealth Creation</h3>
                    <p>From mutual funds to alternative investments, we identify high-potential opportunities to grow your portfolio meaningfully.</p>
                  </div>
                </div>

                <div className="lenis-card" data-card="2">
                  <div className="card-content">
                    <h3>Tax Planning</h3>
                    <p>Integrating tax planning in your investment journey — we ensure you save more, comply effortlessly, and grow your wealth in a smart manner.</p>
                  </div>
                </div>

                <div className="lenis-card" data-card="3">
                  <div className="card-content">
                    <h3>Wealth Protection</h3>
                    <p>We deploy risk-managed strategies and periodic reviews to shield your portfolio from market volatility and unexpected setbacks.</p>
                  </div>
                </div>

                <div className="lenis-card" data-card="4">
                  <div className="card-content">
                    <h3>Portfolio Management</h3>
                    <p>Professional portfolio management with continuous monitoring and rebalancing to optimize your investment returns over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="team-title">WHO'S BEHIND INVESTZA</h2>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                Photo Coming Soon
              </div>
              <div className="member-info">
                <h3 className="member-name">Abhishek Mehta</h3>
                <p className="member-role">Founder & Chief Strategist</p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-image">
                Photo Coming Soon
              </div>
              <div className="member-info">
                <h3 className="member-name">Pooja Chandgothia</h3>
                <p className="member-role">Founder & CEO</p>
              </div>
            </div>

            <div className="team-member">
              <div className="member-image">
                Photo Coming Soon
              </div>
              <div className="member-info">
                <h3 className="member-name">Varun Vinayan</h3>
                <p className="member-role">Vice President</p>
              </div>
            </div>
          </div>

          <div className="team-cta">
            <button className="meet-team-btn">
              Meet the Team
              <div className="btn-arrow">→</div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Your Brand. All rights reserved.</p>
        </div>
      </footer>

      {/* Apple Glass Style Download Widget */}
      <div className="download-widget">
        <div className="download-content">
          <div className="qr-container">
            <img src="/qr-code.svg" alt="QR Code" className="qr-code-image" />
          </div>
          <div className="download-info">
            <div className="download-title">Download Wealth Tracker</div>
            <div className="app-store-buttons">
              <div className="store-button google-play-btn">
                <img src="/google_play_icon.svg" alt="Google Play" className="store-icon" />
              </div>
              <div className="store-button app-store-btn">
                <img src="/app_store_icon.svg" alt="App Store" className="store-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;