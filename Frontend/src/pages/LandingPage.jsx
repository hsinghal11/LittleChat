import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to LittleChat</h1>
        <p className="text-xl md:text-2xl mb-12">
          A real-time messaging platform that keeps you connected with friends and colleagues.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register" 
            className="bg-white text-blue-600 hover:bg-blue-100 transition-colors px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-transparent border-2 border-white hover:bg-white/10 transition-colors px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
          <div className="text-3xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold mb-2">Real-time Messaging</h3>
          <p>Instant message delivery with typing indicators and read receipts.</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
          <div className="text-3xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Secure Communication</h3>
          <p>Your conversations are protected with secure authentication.</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
          <div className="text-3xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">User Friendly</h3>
          <p>Clean, intuitive interface designed for the best user experience.</p>
        </div>
      </div>
      
      <footer className="mt-16 text-white/70">
        &copy; {new Date().getFullYear()} LittleChat. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage; 