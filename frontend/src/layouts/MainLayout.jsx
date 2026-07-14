import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import PageTransition from '../components/PageTransition';

export default function MainLayout() {
  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#050816' }}>
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
}
