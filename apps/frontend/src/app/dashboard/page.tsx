import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                Tuberise Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-700">
                Welcome, User {userId ? `(${userId.slice(0, 8)}...)` : ''}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Welcome to Tuberise Analytics!
              </h2>
              <p className="text-slate-600 mb-6">
                Your dashboard is ready. Connect your YouTube channel to get
                started with advanced analytics and AI-powered insights.
              </p>
              <div className="space-y-4">
                <button className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Connect YouTube Channel
                </button>
                <div className="text-sm text-slate-500">
                  <p className="font-medium mb-2">Next steps:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Connect your YouTube channel</li>
                    <li>• Set up Notion integration</li>
                    <li>• Start getting AI-powered insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
