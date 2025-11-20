export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl border border-amber-200 shadow">
        {children}
      </div>
    </div>
  );
}
