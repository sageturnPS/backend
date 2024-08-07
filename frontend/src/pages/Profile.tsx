import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useNavigate } from 'react-router-dom'
import { getCookie } from 'typescript-cookie'
import { useState, useEffect } from 'react'
import { Store, useUserStore } from '@/store'

import ky from 'ky'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  // Pulling profile data from store, updated when user logs in / info gets changed.
  const logout = useUserStore((state) => state.logout)
  const user = useUserStore((state) => state.currentUser)
  const loggedIn = useUserStore((state) => state.loggedIn)
  const navigate = useNavigate()

  const profile = {
    name: user?.first_name + ' ' + user?.last_name,
    id: user?.id,
    role: user?.role,
    defaultStore: user?.preferred_store?.id,
    profile_photo: user?.profile_photo, // Added avatar to the state
  }

  // Setting the stores with a call to the backend
  const [_, setStores] = useState<Store[]>([])
  // const [__, setIsEditing] = useState(false)

  const defaultAvatarUrl = `https://avatar.iran.liara.run/username?username=${profile.name.split(' ')[0]}+${profile.name.split(' ')[1]}`
  const avatarUrl = profile.profile_photo || defaultAvatarUrl

  // const handleStoreChange = (e: { target: { value: any } }) => {
  //   setProfile({ ...profile, defaultStore: e.target.value })
  // }

  // const handleEditClick = () => {
  //   setIsEditing(true)
  // }

  // Changing default store

  async function logoutHandler() {
    await logout()
    if (!user || !loggedIn) {
      navigate('/login')
      toast.success('Successfully logged out.')
    }
  }

  async function getStores() {
    try {
      const response = await ky
        .get('https://backend-latest-8krk.onrender.com/api/stores/get-all', {
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        })
        .json<Store[]>()
      setStores(response)
    } catch (e) {
      console.error('Error Fetching Stores', e)
    }
  }

  useEffect(() => {
    getStores()
  }, [user])

  return (
    <div className="overflow-x-hidden">
      <div className="flex h-screen flex-col">
        <Navbar />
        <main className="flex h-full flex-grow items-center justify-center bg-slate-50 p-6 pt-20 2xl:pt-28">
          <section className="flex h-3/4 w-3/5 items-center rounded-lg bg-white p-12 shadow-md 2xl:h-3/5">
            {/* Container to center content vertically within the white box */}
            <div className="flex w-full items-center justify-evenly">
              <div className="flex w-2/3 flex-col items-start">
                <h1 className="mb-4 text-2xl font-bold 2xl:mb-8 2xl:text-4xl">
                  Hi {profile.name},
                </h1>
                <div className="space-y-4 2xl:space-y-8 2xl:text-2xl">
                  <div className="flex items-center">
                    <span className="mr-1 font-bold">Name: </span>
                    <span>{profile.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 font-bold">Role: </span>
                    <span>{profile.role}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 font-bold">ID: </span>
                    <span>{profile.id}</span>
                  </div>
                </div>
                <button
                  className="mt-6 rounded bg-logoblue px-4 py-2 text-slate-50 hover:bg-logobluehover 2xl:mt-10 2xl:h-12 2xl:text-2xl"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
              <div className="text-center">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="mx-auto mb-4 h-44 w-44 rounded-full object-cover 2xl:h-60 2xl:w-60"
                />
                <img
                  src="assets/Logo_full.svg"
                  alt="Albertsons Logo"
                  className="mx-auto w-44 2xl:w-60"
                />
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default ProfilePage
