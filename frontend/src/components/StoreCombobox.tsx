import * as React from 'react'
import ky from 'ky'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Store } from '@/store' // Ensure this import is correct
import { getCookie } from 'typescript-cookie'

interface Props {
  onChange: (store: any | null) => void // Single store
  stored: any[]
}

interface GroupedStores {
  [key: string]: { [key: string]: Store[] }
}

const StoreCombobox: React.FC<Props> = ({ onChange }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedState, setSelectedState] = React.useState<string | null>(null)
  const [selectedBanner, setSelectedBanner] = React.useState<string | null>(
    null
  )
  const [stores, setStores] = React.useState<GroupedStores>({})
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(null) // Single store
  const [loadingStores, setLoadingStores] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true
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

        const groupedStores: GroupedStores = response.reduce(
          (acc: GroupedStores, store: Store) => {
            const state = store.state || 'Unknown'
            const banner = store.banner || 'Unknown'

            if (!acc[state]) {
              acc[state] = {}
            }
            if (!acc[state][banner]) {
              acc[state][banner] = []
            }
            acc[state][banner].push(store)

            return acc
          },
          {}
        )

        if (isMounted) {
          setStores(groupedStores)
        }
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        if (isMounted) {
          setError('Failed to load stores.')
        }
      } finally {
        if (isMounted) {
          setLoadingStores(false)
        }
      }
    }

    fetchStores()

    return () => {
      isMounted = false
    }
  }, [])

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const state = event.target.value
    setSelectedState(state)
    setSelectedBanner(null) // Reset banner when state changes
  }

  const handleBannerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const banner = event.target.value
    setSelectedBanner(banner)
  }

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
    onChange(store) // Notify parent component of the selected store
    setOpen(false) // Close the popover after selection
  }

  const filteredStores = React.useMemo(() => {
    let filtered: Store[] = []

    if (selectedState && selectedBanner) {
      filtered = stores[selectedState]?.[selectedBanner] || []
    } else if (selectedState) {
      filtered = Object.keys(stores[selectedState] || {}).flatMap(
        (banner) => stores[selectedState][banner]
      )
    } else if (selectedBanner) {
      filtered = Object.keys(stores).flatMap(
        (state) => stores[state][selectedBanner] || []
      )
    } else {
      filtered = Object.keys(stores).flatMap((state) =>
        Object.keys(stores[state]).flatMap((banner) => stores[state][banner])
      )
    }

    return filtered
  }, [selectedState, selectedBanner, stores])

  const uniqueBanners = React.useMemo(() => {
    if (selectedState) {
      const banners = new Set<string>()
      Object.keys(stores[selectedState] || {}).forEach((banner) =>
        banners.add(banner)
      )
      return Array.from(banners)
    } else {
      const banners = new Set<string>()
      Object.values(stores).forEach((state) => {
        Object.keys(state).forEach((banner) => banners.add(banner))
      })
      return Array.from(banners)
    }
  }, [selectedState, stores])

  return (
    <div className="mr-3 flex flex-col">
      {loadingStores && <p>Loading stores...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <label>Store</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedStore ? selectedStore.name : 'Select store'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <div className="flex">
              <select
                value={selectedState || ''}
                onChange={handleStateChange}
                className="mr-2 w-1/2"
              >
                <option value="">Filter by State</option>
                {Object.keys(stores).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <select
                value={selectedBanner || ''}
                onChange={handleBannerChange}
                className="ml-2 w-1/2"
              >
                <option value="">Filter by Banner</option>
                {uniqueBanners.map((banner) => (
                  <option key={banner} value={banner}>
                    {banner}
                  </option>
                ))}
              </select>
            </div>
            <CommandList>
              {filteredStores.length === 0 ? (
                <CommandEmpty>No store found.</CommandEmpty>
              ) : (
                filteredStores.map((store) => (
                  <CommandItem
                    key={store.id}
                    value={String(store.id)}
                    onSelect={() => handleStoreSelect(store)}
                    className={cn(
                      'cursor-pointer',
                      selectedStore?.id === store.id ? 'bg-gray-100' : ''
                    )}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedStore?.id === store.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {store.name}
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default StoreCombobox
