import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-6">
          Tuberise Analytics
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Advanced YouTube analytics with AI-powered insights and Notion
          integration
        </p>
        <SignedOut>
          <div className="space-x-4">
            <SignInButton
              mode="modal"
              fallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
            >
              <button className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-600 transition-all duration-200 inline-block shadow-lg hover:shadow-xl">
                Get Started
              </button>
            </SignInButton>
            <Link
              href="/auth/signin"
              className="border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 inline-block"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-600 transition-all duration-200 inline-block shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>

        <div className="mt-12 text-sm text-slate-400">
          Clerk Authentication Ready ✅
        </div>
      </div>
    </div>
  );
}
