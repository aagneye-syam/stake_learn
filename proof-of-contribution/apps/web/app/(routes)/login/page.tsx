export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-2">Login with GitHub</h2>
      <p className="text-sm text-gray-600 mb-4">Authenticate to fetch your commits.</p>
      <a
        href="/api/auth/signin/github"
        className="inline-flex items-center px-4 py-2 rounded bg-gray-900 text-white"
      >
        Continue with GitHub
      </a>
    </div>
  );
}

