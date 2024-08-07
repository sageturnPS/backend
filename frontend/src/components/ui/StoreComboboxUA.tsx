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
import { getCookie } from 'typescript-cookie'

type Store = { id: string; name: string }

interface Props {
  onChange: (stores: Store[]) => void
  stored: Store[]
  value: Store[]
}

interface GroupedStores {
  [key: string]: { [key: string]: any[] }
}

function StoreComboboxUA({ onChange, value }: Props) {
  const [open, setOpen] = React.useState(false);
  const [selectedState, setSelectedState] = React.useState<string | null>(null);
  const [selectedBanner, setSelectedBanner] = React.useState<string | null>(null);
  const [stores, setStores] = React.useState<GroupedStores>({});
  const [selectedStores, setSelectedStores] = React.useState<Store[]>(value);
  const [loadingStores, setLoadingStores] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
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
          .json<any[]>()

        const groupedStores: GroupedStores = response.reduce(
          (acc: GroupedStores, store: any) => {
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

        setStores(groupedStores)
      } catch (error) {
        console.error('Failed to fetch stores:', error)
        setError('Failed to load stores.')
      } finally {
        setLoadingStores(false)
      }
    }

    fetchStores()
  }, [])

  React.useEffect(() => {
    setSelectedStores(value);
  }, [value]);

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const state = event.target.value;
    setSelectedState(state);
    setSelectedBanner(null);
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const banner = event.target.value
    setSelectedBanner(banner)
  }

  const handleStoreSelect = (store: Store) => {
    const isSelected = selectedStores.some((s) => s.id === store.id)
    const updatedSelection = isSelected
      ? selectedStores.filter((s) => s.id !== store.id)
      : [...selectedStores, store]

    setSelectedStores(updatedSelection);
    onChange(updatedSelection);
  };

  const handleSelectAll = () => {
    const allStores = filteredStores;
    setSelectedStores(allStores);
    onChange(allStores);
  };

  const handleDeselectAll = () => {
    setSelectedStores([]);
    onChange([]);
  };

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex w-3/4 items-center justify-between rounded border border-gray-300 p-2 text-sm"
            style={{
              backgroundColor: 'transparent',
              transition: 'background-color 0s',
              height: '32px',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <span className="font-normal">
              {selectedStores.length > 1
                ? 'Multiple'
                : selectedStores.length === 1
                  ? selectedStores[0].name
                  : 'Select stores'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <div className="mb-2 flex">
              <select
                value={selectedState || ''}
                onChange={handleStateChange}
                className="mr-2 w-1/2 rounded border border-gray-300 text-sm"
              >
                <option value="">Filter by State</option>
                {Object.keys(stores)
                  .sort()
                  .map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
              </select>
              <select
                value={selectedBanner || ''}
                onChange={handleBannerChange}
                className="ml-2 w-1/2 rounded border border-gray-300 text-sm"
              >
                <option value="">Filter by Banner</option>
                {uniqueBanners.sort().map((banner) => (
                  <option key={banner} value={banner}>
                    {banner}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2 flex items-center space-x-2 p-2">
              <Button onClick={handleSelectAll} variant="outline">
                Select All
              </Button>
              <Button onClick={handleDeselectAll} variant="outline">
                Deselect All
              </Button>
            </div>
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandList>
              {filteredStores.map((store) => (
                <CommandItem
                  key={store.id}
                  value={store.id}
                  onSelect={() => handleStoreSelect(store)}
                  className={cn(
                    'cursor-pointer',
                    selectedStores.some((s) => s.id === store.id)
                      ? 'bg-gray-100'
                      : ''
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedStores.some((s) => s.id === store.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {store.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default StoreComboboxUA
