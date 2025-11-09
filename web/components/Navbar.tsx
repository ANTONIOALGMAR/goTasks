import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tasks" className="font-semibold">
            goTasks
          </Link>
          <Link href="/tasks" className="text-sm text-gray-300 hover:text-white">
            Tasks
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="rounded bg-red-600 hover:bg-red-700 px-3 py-1 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}