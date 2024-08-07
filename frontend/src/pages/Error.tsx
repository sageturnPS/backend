import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const ErrorPage = () => {
  return (
    <div className="overflow-x-hidden">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex h-full flex-grow items-center justify-center bg-slate-50 p-4">
          <div className="mx-auto mb-20 h-2/3 max-w-lg rounded-lg bg-white p-8 text-center shadow-lg shadow-slate-300">
            <h1 className="mb-4 text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mb-4 text-lg">
              Sorry, the page you are looking for doesn't exist.
            </p>
            <p className="mb-4 text-lg">
              Please use the icons in the top right corner to find what you're
              looking for.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default ErrorPage
