import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a página de login ou tarefas
    // Você pode adicionar lógica para verificar se o usuário está autenticado aqui
    // Por enquanto, vamos redirecionar para /tasks
    router.push('/tasks');
  }, [router]);

  return null; // Não renderiza nada, apenas redireciona
}