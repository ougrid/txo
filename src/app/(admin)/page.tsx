import { redirect } from 'next/navigation';

export default function AdminHomePage() {
  // Server-side redirect to how-it-works page when accessing the admin root
  redirect('/how-it-works');
}
