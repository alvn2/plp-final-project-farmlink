import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      icon: 'fas fa-seedling',
      title: 'Crop Management',
      titleSwahili: 'Usimamizi wa Mazao',
      description: 'Track your crops from planting to harvest with detailed records.',
      descriptionSwahili: 'Fuatilia mazao yako kutoka kupanda hadi kuvuna kwa kumbusho za kina.'
    },
    {
      icon: 'fas fa-tasks',
      title: 'Task Tracking',
      titleSwahili: 'Kufuatilia Shughuli',
      description: 'Never miss important farm activities with our task management system.',
      descriptionSwahili: 'Usiwe na uharibifu wa shughuli muhimu za shambani kwa mfumo wetu wa kusimamia kazi.'
    },
    {
      icon: 'fas fa-chart-bar',
      title: 'Farm Analytics',
      titleSwahili: 'Uchambuzi wa Shamba',
      description: 'Get insights into your farm performance and productivity.',
      descriptionSwahili: 'Pata ufahamu kuhusu utendaji na uzalishaji wa shamba lako.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Friendly',
      titleSwahili: 'Rahisi kwa Simu',
      description: 'Access your farm data anywhere, anytime on any device.',
      descriptionSwahili: 'Fikia data za shamba lako popote, wakati wowote kwa kifaa chochote.'
    }
  ];

  const testimonials = [
    {
      name: 'James Mwangi',
      location: 'Kisumu County',
      quote: 'FarmLink has helped me organize my farming activities better. I never forget to fertilize my crops now!',
      quoteSwahili: 'FarmLink imenisaidia kupanga shughuli zangu za kilimo vizuri. Sisahau kuweka mbolea kwenye mazao yangu sasa!'
    },
    {
      name: 'Grace Wanjiku',
      location: 'Nakuru County', 
      quote: 'The task reminders are amazing. My harvest has improved by 30% since I started using FarmLink.',
      quoteSwahili: 'Kumbusho za kazi ni za ajabu. Mavuno yangu yameborekatika asilimia 30 tangu nianze kutumia FarmLink.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-seedling text-white text-3xl"></i>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                FarmLink
                <span className="block text-primary-600 text-2xl lg:text-4xl mt-2">
                  Mazao Manager
                </span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Empowering Kenyan smallholder farmers with digital tools for better crop management
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
              Kuwezesha wakulima wadogo wa Kenya kwa zana za kidijitali kwa ajili ya usimamizi bora wa mazao
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-3 w-full sm:w-auto"
              >
                <i className="fas fa-user-plus mr-2"></i>
                Start Managing Your Farm
              </Link>
              <Link 
                to="/login" 
                className="btn-secondary text-lg px-8 py-3 w-full sm:w-auto"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login - Ingia
              </Link>
            </div>

            {/* External Links */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://farmlinkkenya.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                Live App
              </a>
              <a 
                href="https://docs.google.com/presentation/d/1tSK5vRTx5I8TUvpq8L6WVx-MA4edK3aqlrnvZRLdtmA/edit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <i className="fas fa-presentation mr-2"></i>
                Pitch Deck
              </a>
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-500 mb-4">Over 70% of Kenyans depend on agriculture</p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
                <span><i className="fas fa-users mr-1"></i> 500+ Farmers</span>
                <span><i className="fas fa-seedling mr-1"></i> 1,000+ Crops Tracked</span>
                <span><i className="fas fa-tasks mr-1"></i> 5,000+ Tasks Completed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FarmLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kwa nini uchague FarmLink? - Built specifically for Kenyan farmers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-2xl text-primary-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-primary-600 mb-3">
                  ({feature.titleSwahili})
                </p>
                <p className="text-gray-600 mb-2">
                  {feature.description}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {feature.descriptionSwahili}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works - Jinsi Inavyofanya Kazi
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to better farm management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Register Your Farm
              </h3>
              <p className="text-gray-600">
                Create your account and add your farm location. It's completely free!
              </p>
              <p className="text-sm text-gray-500 italic mt-2">
                Sajili shamba lako - ni bila malipo kabisa!
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Add Your Crops
              </h3>
              <p className="text-gray-600">
                Track maize, beans, sukuma wiki, tomatoes and other crops you're growing.
              </p>
              <p className="text-sm text-gray-500 italic mt-2">
                Ongeza mazao yako - mahindi, maharage, sukuma wiki, na mengine.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Manage Tasks
              </h3>
              <p className="text-gray-600">
                Set reminders for fertilizing, weeding, harvesting and other farm activities.
              </p>
              <p className="text-sm text-gray-500 italic mt-2">
                Simamia shughuli - kuweka mbolea, kupalilia, kuvuna, na mengine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Farmers Say - Wakulima Wanasema Nini
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from real farmers across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user text-primary-600"></i>
                  </div>
                  <div className="flex-1">
                    <div className="mb-4">
                      <i className="fas fa-quote-left text-primary-600 text-lg"></i>
                    </div>
                    <p className="text-gray-700 mb-3 italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="text-sm text-gray-500 mb-4 italic">
                      "{testimonial.quoteSwahili}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-primary-100 mb-2">
            Join hundreds of Kenyan farmers who are already using FarmLink
          </p>
          <p className="text-lg text-primary-200 mb-8">
            Jiunge na mamia ya wakulima wa Kenya wanaotumia FarmLink
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/register" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg text-lg transition-colors w-full sm:w-auto"
            >
              <i className="fas fa-rocket mr-2"></i>
              Get Started Free
            </Link>
            <Link 
              to="/login" 
              className="bg-primary-700 text-white hover:bg-primary-800 font-semibold px-8 py-3 rounded-lg text-lg transition-colors w-full sm:w-auto"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              I Have an Account
            </Link>
          </div>

          <div className="mt-8 text-primary-200">
            <p className="text-sm mb-4">
              <i className="fas fa-shield-alt mr-1"></i>
              Free forever • No credit card required • Secure & Private
            </p>
            
            {/* Additional Links */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm">
              <a 
                href="https://farmlinkkenya.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-200 hover:text-white transition-colors flex items-center"
              >
                <i className="fas fa-external-link-alt mr-1"></i>
                Live Application
              </a>
              <span className="text-primary-300 hidden sm:inline">•</span>
              <a 
                href="https://docs.google.com/presentation/d/1tSK5vRTx5I8TUvpq8L6WVx-MA4edK3aqlrnvZRLdtmA/edit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-200 hover:text-white transition-colors flex items-center"
              >
                <i className="fas fa-presentation mr-1"></i>
                View Pitch Deck
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;