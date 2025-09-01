import React from 'react';

const FeaturedDestinations: React.FC = () => {
  const destinations = [
    {
      id: 1,
      name: "Enjoy the great cold",
      properties: "6,879 properties",
      image: "https://images.unsplash.com/photo-1551524164-6cf2ac531fb4?w=400&h=500&fit=crop"
    },
    {
      id: 2,
      name: "Pick up the earliest sunrise",
      properties: "9,849 properties", 
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop"
    },
    {
      id: 3,
      name: "Unique stay",
      properties: "12,879 properties",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=500&fit=crop"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 font-['DM_Sans']">
            Live anywhere
          </h2>
          <p className="text-xl text-gray-600 font-['Poppins']">
            Keep calm & travel on
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div key={destination.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/5]">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-['Poppins'] text-center">
                {destination.name}
              </h3>
              <p className="text-sm text-gray-600 font-['Poppins'] text-center">
                {destination.properties}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-bold font-['DM_Sans'] hover:border-blue-600 hover:text-blue-600 transition-colors">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDestinations;