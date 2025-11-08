import { useState, type FormEvent } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const res = await fetch(`http://localhost:8080${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.token) {
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      window.location.href = '/tasks';
    } else {
      alert(data.error || 'Falha');
    }
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">goTasks - {mode === 'login' ? 'Entrar' : 'Registrar'}</h1>
        <form onSubmit={submit} className="space-y-3">
          {mode === 'register' && (
            <input className="w-full border rounded px-3 py-2" placeholder="Nome" value={name} onChange={e=>setName(e.target.value)} />
          )}
          <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700">
            {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Registrar')}
          </button>
        </form>
        <p className="mt-3 text-sm">
          {mode === 'login' ? (
            <a href="#" className="text-blue-600" onClick={()=>setMode('register')}>Não tem conta? Registre-se</a>
          ) : (
            <a href="#" className="text-blue-600" onClick={()=>setMode('login')}>Já tem conta? Entrar</a>
          )}
        </p>
        <p className="mt-2 text-sm"><a className="text-gray-600" href="/tasks">Ir para Tasks (precisa de token)</a></p>
      </div>
    </div>
  );
}