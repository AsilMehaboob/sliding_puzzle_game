import dynamic from 'next/dynamic';
import { BorderBeamDemo } from './components/BorderBeam';

// Dynamically import the Puzzle component with SSR disabled
const Puzzle = dynamic(() => import('./components/Game'), {
  ssr: false, // Disable SSR for this component
});

const Home: React.FC = () => {
  return (
    <div>
      <Puzzle />

    </div>
  );
};

export default Home;
