import { Link } from 'react-router-dom';
import { buttonClass } from '../components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-32 text-center">
      <p className="font-serif text-[10rem] leading-none text-rose">404</p>
      <h1 className="mt-4 font-serif text-5xl">This page went off-script.</h1>
      <p className="mt-4 text-muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className={`${buttonClass('primary', 'lg')} mt-10`}>Back home</Link>
    </div>
  );
}
