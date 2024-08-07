import { Link } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const UnauthorizedPage = () => {
  return (
    <div>
      <div className="min-h-screen text-center text-3xl">
        <Navbar />
        <div className="pt-36 text-center">
          Access Unauthorized.
          <br />
          Please{' '}
          <Link to="/login" className="underline">
            Login.
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default UnauthorizedPage
