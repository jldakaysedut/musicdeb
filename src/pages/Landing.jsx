import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-5xl font-bold mb-4 text-green-400">JamList</h1>
      <p className="text-gray-400 mb-8 max-w-md text-lg">
        Your personal music vault. Upload your `.mp3` files, manage your playlist, and play your tracks anywhere.
      </p>
      
      <div className="flex gap-4 w-full max-w-xs justify-center">
        <Link 
          to="/login" 
          className="flex-1 py-3 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="flex-1 py-3 bg-transparent border-2 border-gray-600 text-white font-bold rounded-full hover:border-white transition"
        >
          Register
        </Link>
      </div>
    </div>
  )
}