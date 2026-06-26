import { useLocation, Link } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
      <div className="bg-white shadow-lg rounded-xl p-10 text-center max-w-lg w-full">

        <h1 className="text-7xl font-bold text-blue-600">404</h1>

        <h2 className="text-2xl font-semibold mt-4">
          Page Not Found
        </h2>

        <p className="text-slate-600 mt-3">
          The page
          <span className="font-semibold">
            {" "}
            {location.pathname}
          </span>{" "}
          does not exist.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>

      </div>
    </div>
  );
}