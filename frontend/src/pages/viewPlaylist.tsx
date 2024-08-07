import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import '@/fonts/font.css'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ky from 'ky'
import { getCookie } from 'typescript-cookie'
import ErrorPage from './Error'

interface CarouselOrientationProps {
  storeId: string
  date: string
  onStoreNameFetched: (name: string) => void // Add callback to pass store name
}

const CarouselOrientation: React.FC<CarouselOrientationProps> = ({
  storeId,
  date,
  onStoreNameFetched,
}) => {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStoreName = async (storeId: string) => {
      try {
        const response = await ky
          .get(
            `https://backend-latest-8krk.onrender.com/api/stores/get-id/${storeId}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookie('token')}`,
              },
            }
          )
          .json<{ name: string }>()

        if (response && response.name) {
          onStoreNameFetched(response.name) // Pass store name to parent
        } else {
          throw new Error('Store name not found')
        }
      } catch (error) {
        console.error('Error fetching store details: ', error)
      }
    }

    const fetchPlaylistByDateAndStore = async (
      storeId: string,
      date: string
    ) => {
      setLoading(true)
      try {
        const response = await ky
          .get(
            `https://backend-latest-8krk.onrender.com/api/playlists/store/${storeId}/date/${date}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookie('token')}`,
              },
            }
          )
          .json<{ id: number }>()

        if (response && response.id) {
          fetchAdsByPlaylistId(response.id)
        } else {
          throw new Error('Playlist ID not found')
        }
      } catch (error) {
        console.error('Error fetching playlists: ', error)
        setLoading(false)
      }
    }

    const fetchAdsByPlaylistId = async (id: number) => {
      try {
        const response = await ky
          .get(
            `https://backend-latest-8krk.onrender.com/api/ads/playlist/${id}`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookie('token')}`,
              },
            }
          )
          .json<any[]>()

        setAds(response)
        setLoading(false)
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
    }

    fetchStoreName(storeId)
    fetchPlaylistByDateAndStore(storeId, date)
  }, [storeId, date])

  if (loading) return <p>Loading...</p>

  return (
    <div className="relative w-full max-w-full">
      <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 2,
        }}
        orientation="horizontal"
        className="mx-auto mt-5 h-[50vh] w-full"
      >
        <CarouselContent className="-mb-13 ml-20 flex w-64">
          {ads.map((ad) => (
            <CarouselItem
              key={ad.id}
              className="w-full flex-shrink-0 p-4 md:w-1/2 lg:w-1/3"
              onClick={() => navigate(`/view/${ad.id}`)}
            >
              <Card className="flex h-full flex-col items-center bg-white shadow-lg">
                <CardContent className="flex flex-col items-center p-6">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="mb-2 h-44 w-44 rounded-md object-cover"
                  />
                  <h3 className="text-center text-lg font-medium">
                    {ad.title}
                  </h3>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg 2xl:top-1/4"
          aria-label="Previous Slide"
        />
        <CarouselNext
          className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg 2xl:top-1/4"
          aria-label="Next Slide"
        />
      </Carousel>
    </div>
  )
}

const ViewPlaylist: React.FC = () => {
  const { store_id, date } = useParams<{ store_id: string; date: string }>()
  const [storeName, setStoreName] = useState<string>('')
  if (!date || !store_id) {
    return <ErrorPage />
  }

  const isValidStoreId =
    !isNaN(Number(store_id)) && Number.isInteger(Number(store_id))
  const isValidDate =
    /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date))

  if (!isValidStoreId || !isValidDate) {
    return <ErrorPage />
  }

  return (
    <div className="overflow-x-hidden">
      <div className="flex min-h-screen w-screen flex-col overflow-hidden bg-slate-50">
        <Navbar />
        <div className="flex-grow p-4 pt-24 2xl:pt-32">
          <h2 className="ml-4 mt-4 text-left text-2xl font-medium">
            Playlist for {date} {storeName && `at ${storeName}`}
          </h2>
          <div className="flex justify-center">
            <div className="w-full max-w-full px-4 lg:px-8">
              <CarouselOrientation
                storeId={store_id}
                date={date}
                onStoreNameFetched={setStoreName}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ViewPlaylist
