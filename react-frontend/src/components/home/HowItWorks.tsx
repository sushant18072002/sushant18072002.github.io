import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Find trips that fit a flexible lifestyle",
      description: "Stacks is a production-ready library of stackable content blocks built in React Native",
      color: "bg-blue-500"
    },
    {
      number: "02", 
      title: "Travel with more confidence",
      description: "Stacks is a production-ready library of stackable content blocks built in React Native",
      color: "bg-purple-500"
    },
    {
      number: "03",
      title: "See what's really included", 
      description: "Stacks is a production-ready library of stackable content blocks built in React Native",
      color: "bg-emerald-500"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 font-['DM_Sans']">
                Travel to make memories all around the world
              </h2>
              <p className="text-xl text-gray-600 font-['Poppins']">
                Find trips that fit a flexible lifestyle
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className={`${step.color} text-white w-12 h-8 rounded-xl flex items-center justify-center font-bold font-['DM_Sans'] text-sm flex-shrink-0`}>
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 font-['Poppins']">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 font-['Poppins'] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold font-['DM_Sans'] hover:bg-blue-700 transition-colors">
                Start your search
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=750&fit=crop"
                alt="Travel planning"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -left-8 top-1/4 bg-white rounded-2xl p-4 shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  ✈️
                </div>
                <div>
                  <p className="font-semibold text-gray-900 font-['DM_Sans']">Flight Booked</p>
                  <p className="text-sm text-gray-600 font-['Poppins']">Paris → Tokyo</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 bottom-1/4 bg-white rounded-2xl p-4 shadow-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  🏨
                </div>
                <div>
                  <p className="font-semibold text-gray-900 font-['DM_Sans']">Hotel Reserved</p>
                  <p className="text-sm text-gray-600 font-['Poppins']">5-star luxury</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;