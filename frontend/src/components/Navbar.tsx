import { HiOutlinePlus } from 'react-icons/hi'
import { LuClipboardEdit, LuUserCircle2 } from 'react-icons/lu'
import { RxCalendar } from 'react-icons/rx'
import Logo from './Logo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useUserStore, User } from '@/store'
import toast from 'react-hot-toast'

const Navbar = () => {
  // Pulling info from store variables
  const navigate = useNavigate()
  const logout = useUserStore((state) => state.logout)
  const loggedIn = useUserStore((state) => state.loggedIn)
  const currUser = useUserStore((state) => state.currentUser)

  const [user, setUser] = useState<User>()
  const iconSize = 35

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login')
    } else if (!user && loggedIn) {
      setUser(currUser!)
    }
  }, [loggedIn, currUser, user, navigate])

  async function handleLogout() {
    await logout()
    navigate('/login')
    toast.success('Successfully Logged Out')
  }

  if (!loggedIn) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex h-20 justify-between border-b-4 border-slate-200 bg-white py-6 2xl:h-28">
      <div className="ml-8 flex items-center justify-center">
        <button onClick={() => navigate('/')}>
          <Logo />
        </button>
      </div>
      <div className="z-50 ml-auto mr-14 flex items-center gap-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  navigate('/')
                }}
                className="flex items-center"
              >
                <img
                  src="/assets/blue_albert.png"
                  alt="Albert"
                  className="mr-0 inline-block h-9 w-fit"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ask Albert</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  navigate('/upload')
                }}
                className="flex items-center"
              >
                <HiOutlinePlus size={iconSize} style={{ color: '#00539F' }} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload an Ad</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  navigate('/schedule')
                }}
                className="flex items-center"
              >
                <RxCalendar size={iconSize} style={{ color: '#00539F' }} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Schedule</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  navigate('/search')
                }}
                className="flex items-center"
              >
                <LuClipboardEdit size={iconSize} style={{ color: '#00539F' }} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search & Edit</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center">
              <LuUserCircle2 size={iconSize} style={{ color: '#00539F' }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-8">
            <DropdownMenuLabel>Hi, {user?.first_name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Navbar
