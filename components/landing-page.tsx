"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Lightbulb, TrendingUp, Award, Globe, Zap, Shield, Sparkles, Rocket, Target, Star } from "lucide-react"
import { AuthForm } from "@/components/auth-form"

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)

  if (showAuth) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(147,51,234,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/80 backdrop-blur-xl border border-purple-200/50 rounded-full px-8 py-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">Inkubeta</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 bg-transparent border-0 rounded-full px-4 py-2"
                onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                About
              </Button>
              <Button 
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 bg-transparent border-0 rounded-full px-4 py-2"
                onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Services
              </Button>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full px-6 py-2" onClick={() => setShowAuth(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <Badge className="mb-6 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border border-purple-200 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              The Future of Startup Collaboration
            </Badge>
            <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-8 leading-tight">
              Where Great
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                {" "}Ideas{" "}
              </span>
              Take Flight
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Join the most innovative startup community. Connect with founders, investors, and mentors. 
              Build, grow, and scale your startup with Inkubeta's cutting-edge platform.
            </p>
            <div className="flex justify-center">
              <Button 
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-12 py-5 text-xl font-semibold shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 rounded-full"
                onClick={() => setShowAuth(true)}
              >
                Start Your Journey
                <ArrowRight className="ml-3 w-7 h-7" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Inkubeta Section */}
      <section id="about-section" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">What is Inkubeta?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Inkubeta is the premier platform for startup founders, investors, and innovators to connect, 
              collaborate, and accelerate their growth journey with AI-powered tools and global networks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-pink-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800 mb-4">Community First</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Connect with thousands of founders, investors, and mentors in our vibrant ecosystem.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800 mb-4">Innovation Hub</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Share ideas, get feedback, and collaborate on groundbreaking projects with AI assistance.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-800 mb-4">Growth Accelerator</CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Access resources, funding opportunities, and mentorship to scale your startup rapidly.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Everything you need to build, launch, and scale your startup successfully with cutting-edge technology.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-pink-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Startup Showcase</h3>
                <p className="text-gray-600">Showcase your startup to potential investors and partners worldwide with AI-powered optimization.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Pitch Polisher</h3>
                <p className="text-gray-600">AI-powered pitch deck optimization and presentation coaching with real-time feedback.</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Grant Opportunities</h3>
                <p className="text-gray-600">Discover and apply for startup grants and funding opportunities with smart matching.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-800 mb-6">Opportunities You'll Gain</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join Inkubeta and unlock a world of possibilities for your startup journey with cutting-edge technology.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800">Access to Capital</h3>
                  <p className="text-gray-600 text-lg">Connect with angel investors, VCs, and access exclusive funding rounds with AI-powered matching.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800">Strategic Partnerships</h3>
                  <p className="text-gray-600 text-lg">Form partnerships with complementary startups and established companies through smart networking.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800">Expert Guidance</h3>
                  <p className="text-gray-600 text-lg">Get guidance from successful entrepreneurs and industry leaders with personalized matching.</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-bold text-lg">4</span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-800">Global Network</h3>
                  <p className="text-gray-600 text-lg">Join a worldwide community of innovators and thought leaders with real-time collaboration tools.</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-10 border border-purple-200 shadow-2xl">
                <div className="flex items-center mb-6">
                  <Rocket className="w-8 h-8 mr-3 text-purple-500" />
                  <h3 className="text-3xl font-bold text-gray-800">Ready to Start?</h3>
                </div>
                <p className="mb-8 text-lg text-gray-600">Join thousands of founders who have already transformed their ideas into successful businesses with our platform.</p>
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105 rounded-full"
                  onClick={() => setShowAuth(true)}
                >
                  Create Your Profile
                  <ArrowRight className="ml-2 w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-purple-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">Inkubeta</span>
              </div>
              <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
                The premier platform for startup founders, investors, and innovators to connect, 
                collaborate, and accelerate their growth journey with cutting-edge AI technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-gray-800 text-lg">Platform</h4>
              <ul className="space-y-4 text-gray-600">
                <li><button onClick={() => setShowAuth(true)} className="hover:text-purple-600 transition-colors text-lg cursor-pointer text-left bg-transparent border-0">Startup Showcase</button></li>
                <li><button onClick={() => setShowAuth(true)} className="hover:text-purple-600 transition-colors text-lg cursor-pointer text-left bg-transparent border-0">Pitch Polisher</button></li>
                <li><button onClick={() => setShowAuth(true)} className="hover:text-purple-600 transition-colors text-lg cursor-pointer text-left bg-transparent border-0">Grant Opportunities</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-gray-800 text-lg">Company</h4>
              <ul className="space-y-4 text-gray-600">
                <li><a href="#about-section" className="hover:text-purple-600 transition-colors text-lg cursor-pointer">About Us</a></li>
                <li><button onClick={() => setShowAuth(true)} className="hover:text-purple-600 transition-colors text-lg cursor-pointer text-left bg-transparent border-0">Careers</button></li>
                <li><button onClick={() => setShowAuth(true)} className="hover:text-purple-600 transition-colors text-lg cursor-pointer text-left bg-transparent border-0">Privacy Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-200 mt-16 pt-8 text-center text-gray-500">
            <p className="text-lg">&copy; 2024 Inkubeta. All rights reserved. Empowering the next generation of innovators.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 