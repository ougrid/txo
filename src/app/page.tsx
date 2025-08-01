import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'MiniSeller - Redirecting...',
};

export default function HomePage() {
  // Server-side redirect to the how-it-works page as the default landing page
  redirect('/how-it-works');
}
