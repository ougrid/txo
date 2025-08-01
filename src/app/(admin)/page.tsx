import { permanentRedirect } from 'next/navigation';

export default function AdminHomePage() {
  // Server-side permanent redirect to how-it-works page when accessing the admin root
  permanentRedirect('/how-it-works');
}
