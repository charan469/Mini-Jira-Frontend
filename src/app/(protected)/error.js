"use client";

export default function ErrorPage({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 shadow-lg rounded-3xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-3xl font-semibold mb-3">
          Oops! Something went wrong.
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          {error?.message || "Please try again or contact support if it keeps happening."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-full bg-black text-white px-6 py-3 text-sm font-semibold hover:bg-slate-900 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}