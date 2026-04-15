import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">The page you’re looking for doesn’t exist.</p>
        <div className="mt-6">
          <Button as={Link} to="/">
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}
