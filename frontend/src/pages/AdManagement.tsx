import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import StoreCombobox from '@/components/StoreCombobox'
import ProductTypeCombobox from '@/components/ProductTypeCombobox'
import SortDropdown from '@/components/SortDropdown'
import { Input } from '@/components/ui/input'
import ky from 'ky'
import { getCookie } from 'typescript-cookie'

interface Ad {
  id: number
  title: string
  image: string
  date_created: string
  product_id: string
  product_name: string
}

interface Store {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  category: string
}

const AdManagement: React.FC = () => {
  const navigate = useNavigate()
  const [ads, setAds] = React.useState<Ad[]>([])
  const [searchQuery, setSearchQuery] = React.useState<string>('')
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(null)
  const [selectedProductType, setSelectedProductType] =
    React.useState<Product | null>(null)
  const [filteredAds, setFilteredAds] = React.useState<Ad[]>([])
  const [stores, setStores] = React.useState<Store[]>([])
  const [sortBy, setSortBy] = React.useState<string>('newest-to-oldest')
  const [sortOrder, setSortOrder] = React.useState<string>('asc')
  const [_, setLoadingStores] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const fetchAds = async () => {
    try {
      const response = await ky
        .get('https://backend-latest-8krk.onrender.com/api/ads/get-all', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        })
        .json<Ad[]>()
      setAds(response)
      setFilteredAds(response)
    } catch (error) {
      console.error('Failed to fetch ads:', error)
    }
  }

  const fetchAdsByStore = async (storeId: number) => {
    try {
      const response = await ky
        .get(
          `https://backend-latest-8krk.onrender.com/api/ads/store/${storeId}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          }
        )
        .json<Ad[]>()
      setFilteredAds(response)
    } catch (error) {
      console.error('Failed to fetch ads by store:', error)
    }
  }

  const fetchAdsByProductType = async (productTypeId: number) => {
    try {
      const response = await ky
        .get(
          `https://backend-latest-8krk.onrender.com/api/ads/product/${productTypeId}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          }
        )
        .json<Ad[]>()
      setFilteredAds(response)
    } catch (error) {
      console.error('Failed to fetch ads by product type:', error)
    }
  }

  const fetchStores = async () => {
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

  React.useEffect(() => {
    fetchAds()
    fetchStores()
  }, [])

  React.useEffect(() => {
    let updatedAds = [...ads]

    if (searchQuery) {
      const searchId = Number(searchQuery)
      updatedAds = updatedAds.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (searchId && ad.id === searchId)
      )
    }

    if (selectedProductType) {
      fetchAdsByProductType(selectedProductType.id)
    } else if (selectedStore) {
      fetchAdsByStore(selectedStore.id)
    } else {
      updatedAds = sortAds(updatedAds, sortBy, sortOrder)
      setFilteredAds(updatedAds)
    }
  }, [searchQuery, selectedProductType, selectedStore, ads, sortBy, sortOrder])

  const sortAds = (adsToSort: Ad[], sortBy: string, sortOrder: string) => {
    return adsToSort.sort((a, b) => {
      if (!a.date_created || !b.date_created) return 0

      const dateA = new Date(a.date_created).getTime()
      const dateB = new Date(b.date_created).getTime()

      switch (sortBy) {
        case 'newest-to-oldest':
          return sortOrder === 'asc' ? dateB - dateA : dateA - dateB
        case 'oldest-to-newest':
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        default:
          return 0
      }
    })
  }

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchQuery(event.target.value)
  }

  const handleStoreChange = (store: Store | null) => {
    setSelectedStore(store)
  }

  const handleProductTypeChange = (productType: Product | null) => {
    setSelectedProductType(productType)
  }

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder((prevSortOrder) =>
        prevSortOrder === 'asc' ? 'desc' : 'asc'
      )
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
  }

  const handleAdClick = (adId: number) => {
    navigate(`/view/${adId}`)
  }

  return (
    <div className="overflow-x-hidden">
      <div className="mb-6 flex min-h-screen flex-col bg-slate-50">
        <Navbar />
        <main className="container mt-5 flex-grow pt-24 2xl:pt-32">
          <h1 className="mb-4 text-2xl font-medium">Search Ads</h1>
          <div className="mb-4 flex flex-row justify-start">
            <div className="mr-2 flex basis-1/2 flex-col">
              <label htmlFor="search">Search by title or ID</label>
              <Input
                type="search"
                id="search"
                name="search"
                aria-label="Search bar"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for an ad"
              />
            </div>
            <SortDropdown onChange={handleSortChange} />
            <StoreCombobox onChange={handleStoreChange} stored={stores} />
            <ProductTypeCombobox onChange={handleProductTypeChange} />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="group relative cursor-pointer"
                onClick={() => handleAdClick(ad.id)}
              >
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="mt-3 h-96 w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-slate-800 bg-opacity-50 p-2 px-4 text-white opacity-0 duration-500 group-hover:opacity-100">
                  <div className="flex w-full justify-between">
                    <div className="font-normal">
                      <p className="text-sm">{ad.title}</p>
                      <p className="text-xs">
                        Created:{' '}
                        {new Date(ad.date_created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default AdManagement
