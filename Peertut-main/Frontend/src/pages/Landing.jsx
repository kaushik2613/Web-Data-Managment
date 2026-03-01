import React from 'react'
import Hero from '../components/landing/Hero/Hero'
import Features from '../components/landing/Features/Features'
import HowItWorks from '../components/landing/HowItWorks/HowItWorks'
import Footer from '../components/landing/Footer/Footer'

function Landing() {
  return (
    <div>
      <section id="home" aria-label="Hero section">
        <Hero />
      </section>
      
      <section id="features" aria-label="Platform features">
        <Features />
      </section>
      
      <section id="howItWorks" aria-label="How PeerTut works">
        <HowItWorks />
      </section>
      
      <footer id="footer" role="contentinfo" aria-label="Site footer">
        <Footer />
      </footer>
    </div>
  )
}

export default Landing
