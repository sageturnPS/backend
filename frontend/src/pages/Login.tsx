import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa' // Importing eye icons from react-icons
import { useUserStore } from '@/store'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const login = useUserStore((state) => state.login)
  const user = useUserStore((state) => state.currentUser)

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault()

    // Validate username
    if (!username) {
      setUsernameError('Please enter your username.')
      return
    }

    // Validate password
    if (!password) {
      setPasswordError('Please enter your password.')
      return
    }

    // Clear any previous error messages if there were any
    setUsernameError('')
    setPasswordError('')

    try {
      const user = await login(username, password)

      // Navigate only if login is successful
      if (user) {
        toast.success(
          `Successfully logged in. \n Welcome ${user.first_name} ${user.last_name}.`
        )
        navigate('/')
      } else {
        toast.error('Error Logging in.')
      }
    } catch (error) {
      console.error('Login failed', error)
    }
  }

  useEffect(() => {
    console.log('called')
  }, [login, user])

  return (
    <>
      {/* Background */}
      <div className="flex min-h-screen items-center justify-center bg-logoblue">
        {/* Box */}
        <div className="relative m-6 flex flex-col space-y-10 rounded-2xl bg-white p-6 shadow-2xl md:m-0 md:flex-row md:space-y-0 md:p-20">
          <div>
            {/* Left side  */}
            <h2 className="font-rubik mb-5 text-center text-3xl font-medium">
              Sign in
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 p-6 outline-none placeholder:font-sans placeholder:font-light"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {/* Display username error message */}
              {usernameError && (
                <p className="mt-2 text-red-500">{usernameError}</p>
              )}

              <div className="relative mt-3 w-full">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="w-full rounded-md border border-gray-300 p-6 placeholder:font-sans placeholder:font-light"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Display password error message */}
              {passwordError && (
                <p className="mt-2 text-red-500">{passwordError}</p>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                className="mt-6 w-full rounded-md bg-blue-600 p-4 text-white transition duration-300 hover:bg-blue-700"
              >
                Sign in
              </button>
            </form>
          </div>
          <img
            src="images/Logo.png"
            alt="Logo"
            className="hidden w-[400px] text-left md:ml-10 md:block"
          />
        </div>
      </div>
    </>
  )
}

export default Login
