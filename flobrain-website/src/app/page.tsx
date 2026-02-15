import { redirect } from 'next/navigation';
import HomePage from "./home/index"; 

export default function Home() {
  const userLogged = false; 

  if (userLogged) {
    redirect('/home'); 
  }

  return <HomePage />;
}