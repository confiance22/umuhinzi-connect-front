import SoftBackdrop from '../components/landing/SoftBackdrop'
import LenisScroll from '../components/landing/LenisScroll'
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import TrustBar from '../components/landing/TrustBar'
import Features from '../components/landing/Features'
import Categories from '../components/landing/Categories'
import HarvestPreview from '../components/landing/HarvestPreview'
import Story from '../components/landing/Story'
import CTA from '../components/landing/CTA'
import PublicFooter from '../components/public/PublicFooter'

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#f7faf8] text-ink transition-colors duration-300 dark:bg-[#050505] dark:text-white">
      <SoftBackdrop />
      <LenisScroll />
      <Navbar />
      <div>
        <Hero />
        <TrustBar />
        <Features />
        <Categories />
        <HarvestPreview />
        <Story />
        <CTA />
      </div>
      <PublicFooter />
    </div>
  )
}
