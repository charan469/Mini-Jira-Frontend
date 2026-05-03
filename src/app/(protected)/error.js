"use client";

export default function ErrorPage({ error, reset }) {
  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-bold mb-4">Something went wrong</h1>

      <button
        onClick={() => reset()}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Try Again
      </button>
    </div>
  );
}