export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Tuberise Analytics
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Advanced YouTube analytics with AI-powered insights and Notion integration
        </p>
        <div className="space-x-4">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Get Started
          </button>
          <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Learn More
          </button>
        </div>
        <div className="mt-12 text-sm text-gray-500">
          Development Environment Setup Complete ✅
        </div>
      </div>
    </div>
  );
}
