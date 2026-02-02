import { redirect } from 'next/navigation';
import HomePage from "./(app)/home/index"; 

export default function Home() {
  const userLogged = true; 

  if (userLogged) {
    redirect('/home'); 
  }

  return <HomePage />;
}