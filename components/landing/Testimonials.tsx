export const Testimonials = () => {
  return (
    <section
      className="py-24  from-blue-50 to-blue-100 relative overflow-hidden"
      id="success-stories"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Testimonial Card */}
          <div className="relative group">
            {/* Rounded Border / Frame */}
            <div className="absolute -inset-3 rounded-3xl border-4 border-amber-300 shadow-lg transform rotate-1 group-hover:scale-105 transition-transform duration-500"></div>

            {/* Card Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2">
              <h2 className="text-3xl font-serif font-bold text-brand-700 mb-4">
                "They didn't just tell us we were ready; they helped us get listed."
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We started with a simple eligibility check on irascore.com. The IRA team then helped us restructure our assets to meet the 1.5 Cr NTA requirement, guiding us all the way to the bell-ringing ceremony.
              </p>
              <div className="flex items-center mt-6">
                <div className="h-12 w-12 rounded-full bg-gray-300 mr-4 flex-shrink-0 overflow-hidden">
                  <img
                    src="https://picsum.photos/100/100"
                    alt="CEO"
                    className="rounded-full h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rajesh Kumar</div>
                  <div className="text-amber-600 text-sm">Managing Director, Apollo Green Energy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Image */}
          <div className="relative group">
            {/* Rounded Border / Frame */}
            <div className="absolute -inset-4 rounded-3xl border-4 border-amber-300 shadow-lg transform rotate-1 group-hover:scale-105 transition-transform duration-500"></div>

            {/* Image */}
            <img
              src="https://picsum.photos/600/400"
              alt="Apollo Green Energy Listing Ceremony"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-64 md:h-80 transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badge */}
            <div className="absolute bottom-4 left-4 bg-brand-100 px-4 py-2 rounded-lg shadow-md">
              <span className="text-brand-900 font-bold text-xs uppercase tracking-wide">Listing Day</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
