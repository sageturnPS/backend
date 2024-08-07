import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StoreComboboxVS from '@/components/ui/StoreComboboxVS'
import { getCookie } from 'typescript-cookie'
import ky from 'ky'
import { Store } from '@/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import SchedulerDataList from '@/components/schedulerDataList'
import { useNavigate } from 'react-router-dom'

interface Ad {
  id: number
  title: string
  startDate: Date
  endDate: Date
}

const ViewSchedule = () => {
  const [adsByDate, setAdsByDate] = useState<{ [key: string]: Ad[] }>({})
  const [loadingAds, setLoadingAds] = useState<boolean>(true)
  const [loadingStores, setLoadingStores] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStores, setSelectedStores] = useState<Store[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [datesPerPage] = useState<number>(5)
  const navigate = useNavigate()

  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getAdsForDate = async (
    storeIds: number[],
    date: Date
  ): Promise<Ad[]> => {
    try {
      const formattedDate = formatDate(date)

      const playlistFetchPromises = storeIds.map(async (storeId) => {
        const url = `https://backend-latest-8krk.onrender.com/api/playlists/store/${storeId}/date/${formattedDate}`
        const response = await ky
          .get(url, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          })
          .json<{ id?: number }>()

        return response.id
      })

      const playlistIds = (await Promise.all(playlistFetchPromises)).filter(
        (id) => id !== undefined
      ) as number[]

      if (playlistIds.length === 0) {
        return []
      }

      const uniqueAds = new Set<number>()

      const adFetchPromises = playlistIds.map(async (playlistId) => {
        const url = `https://backend-latest-8krk.onrender.com/api/ads/playlist/${playlistId}`
        const response = await ky
          .get(url, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          })
          .json<Ad[]>()

        response.forEach((ad) => uniqueAds.add(ad.id))
        return response
      })

      const adsArrays = await Promise.all(adFetchPromises)
      const allAds = adsArrays.flat().filter((ad) => uniqueAds.has(ad.id))

      return Array.from(new Set(allAds.map((ad) => ad.id))).map(
        (id) => allAds.find((ad) => ad.id === id)!
      )
    } catch (error) {
      console.error(error)
      setError('Failed to load ads.')
      return []
    }
  }

  const getAllAds = async (
    startDate: Date,
    endDate: Date,
    storeIds: number[]
  ): Promise<{ [key: string]: Ad[] }> => {
    const adsByDate: { [key: string]: Ad[] } = {}

    const addDays = (date: Date, days: number): Date => {
      const result = new Date(date)
      result.setDate(result.getDate() + days)
      return result
    }

    let currentDate = startDate
    while (currentDate <= endDate) {
      const ads = await getAdsForDate(storeIds, currentDate)
      adsByDate[formatDate(currentDate)] = ads
      currentDate = addDays(currentDate, 1)
    }

    return adsByDate
  }

  useEffect(() => {
    const fetchStores = async () => {
      if (stores.length > 0) return // Prevent fetching if stores are already loaded
      setLoadingStores(true)
      try {
        const response = await ky
          .get('https://backend-latest-8krk.onrender.com/api/stores/get-all', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          })
          .json<Store[]>()
        setStores(response)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        setError('Failed to load stores.')
      } finally {
        setLoadingStores(false)
      }
    }

    fetchStores()
  }, [])

  useEffect(() => {
    const fetchInitialAds = async () => {
      if (stores.length === 0) return

      setLoadingAds(true)
      try {
        const today = new Date()
        const twoWeeksFromNow = new Date()
        twoWeeksFromNow.setDate(today.getDate() + 4) // Set the end date to 2 weeks from today

        setStartDate(formatDate(today))
        setEndDate(formatDate(twoWeeksFromNow))

        const storeIds = stores.map((store) => store.id)
        const allAds = await getAllAds(today, twoWeeksFromNow, storeIds)
        setAdsByDate(allAds)
      } catch (error) {
        console.error('Failed to fetch initial ads:', error)
        setError('Failed to load ads.')
      } finally {
        setLoadingAds(false)
      }
    }

    fetchInitialAds()
  }, [stores])

  useEffect(() => {
    const fetchFilteredAds = async () => {
      if (startDate && endDate) {
        setLoadingAds(true)
        try {
          // Use selectedStores if any, otherwise fall back to all stores
          const storeIds =
            selectedStores.length > 0
              ? selectedStores.map((store) => store.id)
              : stores.map((store) => store.id)

          const startDateObj = new Date(startDate)
          const endDateObj = new Date(endDate)
          const allAds = await getAllAds(startDateObj, endDateObj, storeIds)
          setAdsByDate(allAds)
        } catch (error) {
          console.error('Failed to fetch filtered ads:', error)
          setError('Failed to load ads.')
        } finally {
          setLoadingAds(false)
        }
      }
    }

    fetchFilteredAds()
  }, [startDate, endDate, selectedStores, stores])

  // Pagination logic
  const paginateDates = (
    dates: string[],
    currentPage: number,
    datesPerPage: number
  ) => {
    const indexOfLastDate = currentPage * datesPerPage
    const indexOfFirstDate = indexOfLastDate - datesPerPage
    return dates.slice(indexOfFirstDate, indexOfLastDate)
  }

  const allDates = Object.keys(adsByDate).sort()
  const currentDates = paginateDates(allDates, currentPage, datesPerPage)

  const handleMenuItemClick = (storeId: number, date: string) => {
    navigate(`/playlist/store/${storeId}/date/${date}`)
  }

  console.log(loadingStores, error)

  return (
    <div className="overflow-x-hidden">
      <div className="flex min-h-screen w-screen flex-col overflow-hidden">
        <Navbar />

        <div className="w-full bg-slate-50 p-8 py-6 pt-28 2xl:pt-36">
          <h1 className="mb-4 text-2xl font-medium">View Schedule</h1>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <StoreComboboxVS
              onChange={(stores) => setSelectedStores(stores)}
              stored={stores}
            />
            <div className="flex flex-col">
              <span className="mb-2 font-normal">Select date(s):</span>
              <div className="flex space-x-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded border border-slate-300 p-2 text-sm"
                  style={{ height: '40px' }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded border border-slate-300 p-2 text-sm"
                  style={{ height: '40px' }}
                />
              </div>
            </div>
          </div>

          {loadingAds ? (
            <p className="h-screen">Loading ads...</p>
          ) : (
            currentDates.map((date) => (
              <div key={date} className="mb-8">
                <div className="mb-4 flex flex-row items-center">
                  <h2 className="text-lg font-semibold">{date}</h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="ml-4 border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        style={{ height: '40px' }}
                      >
                        View a playlist
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="max-h-60 w-56 overflow-y-auto rounded border border-slate-300 bg-white shadow-lg">
                      <DropdownMenuLabel>Select a store</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {selectedStores.length > 0 ? (
                          selectedStores
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by store name
                            .map((store) => (
                              <DropdownMenuItem
                                key={store.id}
                                onClick={() =>
                                  handleMenuItemClick(store.id, date)
                                }
                                className="text-sm"
                              >
                                <span>{store.name}</span>
                              </DropdownMenuItem>
                            ))
                        ) : stores.length > 0 ? (
                          stores
                            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by store name
                            .map((store) => (
                              <DropdownMenuItem
                                key={store.id}
                                onClick={() =>
                                  handleMenuItemClick(store.id, date)
                                }
                                className="text-sm"
                              >
                                <span>{store.name}</span>
                              </DropdownMenuItem>
                            ))
                        ) : (
                          <DropdownMenuItem>
                            <span>No stores available</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {adsByDate[date] === undefined ? (
                  <p> Loading ads for {date}...</p>
                ) : adsByDate[date].length > 0 ? (
                  <SchedulerDataList ads={adsByDate[date]} />
                ) : (
                  <p>No ads scheduled for {date}</p>
                )}
              </div>
            ))
          )}
          {!loadingAds && allDates.length > datesPerPage && (
            <div className="mt-4 flex justify-center">
              <div className="flex flex-row items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover"
                >
                  Previous
                </button>
                <span className="px-4">
                  Page {currentPage} of{' '}
                  {Math.ceil(allDates.length / datesPerPage)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        Math.ceil(allDates.length / datesPerPage)
                      )
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(allDates.length / datesPerPage)
                  }
                  className="rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default ViewSchedule
