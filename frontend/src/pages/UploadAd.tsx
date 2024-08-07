import { useState, useCallback, useEffect, Fragment } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import StoreComboboxUA from '@/components/ui/StoreComboboxUA'
import { Toaster } from '@/components/ui/toaster.tsx'
import { toast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { getCookie } from 'typescript-cookie'
import ky from 'ky'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { assignDates } from '@/store'
import { useNavigate } from 'react-router-dom'
import { MdErrorOutline } from 'react-icons/md'

//type Playlist = { id: number; startDate: string; endDate: string }
type Product = { id: string; name: string }
type Store = { id: string; name: string }
type AdResponse = { id: string }

interface FileUploadProps {
  setError: React.Dispatch<React.SetStateAction<string[]>>
}

function FileUpload({ setError }: FileUploadProps) {
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(null)
  const [filePresent, setFilePresent] = useState<File | null>(null)
  const [adTitle, setAdTitle] = useState('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedStores, setSelectedStores] = useState<Store[]>([])
  const [success, setSuccess] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [currProducts, setCurrProducts] = useState<string[]>([]) // Array of product IDs
  const [open, setOpen] = useState(false)
  const [storeComboboxValue, setStoreComboboxValue] = useState<Store[]>([]) // Added state for combobox value
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await ky
          .get(
            'https://backend-latest-8krk.onrender.com/api/products/get-all',
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getCookie('token')}`,
              },
            }
          )
          .json<Product[]>()
        setProducts(productsResponse)

        const storesResponse = await ky
          .get('https://backend-latest-8krk.onrender.com/api/stores/get-all', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getCookie('token')}`,
            },
          })
          .json<Store[]>()
        setStores(storesResponse)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(['Failed to load data.'])
      }
    }

    fetchData()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setFilePresent(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const validateForm = () => {
    const errors: string[] = []

    if (!adTitle) errors.push('Ad Title is required.')
    if (!startDate) errors.push('Start Date is required.')
    if (!endDate) errors.push('End Date is required.')
    if (!filePresent) errors.push('Please upload an image.')
    if (!currProducts.length)
      errors.push('At least one product must be selected.')
    if (!selectedStores.length)
      errors.push('At least one store must be selected.')

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) errors.push('End Date must be after Start Date.')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors)
      return
    }

    const formData = new FormData()
    formData.append('title', adTitle)
    if (filePresent) {
      formData.append('image', filePresent)
    }
    formData.append('product_ids', JSON.stringify(currProducts))
    formData.append('start_date', startDate)
    formData.append('end_date', endDate)
    const storeIds = selectedStores.map((store) => store.id)
    const storeIdsJson = JSON.stringify(storeIds)
    formData.append('store_ids', storeIdsJson)

    try {
      const response = await ky
        .post('https://backend-latest-8krk.onrender.com/api/ads/new', {
          body: formData,
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
          },
        })
        .json<AdResponse>()
      setError([''])

      await addAdToPlaylists(response.id, startDate, endDate, storeIds)
      toast({
        title: 'Ad submitted successfully!',
        description: '',
        action: (
          <ToastAction
            altText="View your ad"
            onClick={() => navigate(`/view/${response.id}`)}
          >
            View your Ad
          </ToastAction>
        ),
      })

      // Reset form fields after successful submission
      resetForm()
    } catch (error) {
      console.error('Error:', error)
      setError(['An error occurred while submitting your ad.'])
    }
  }

  const addAdToPlaylists = async (
    adId: string,
    startDate: string,
    endDate: string,
    storeIds: string[]
  ) => {
    console.log('startDate:', startDate)
    const newStartDate = new Date(
      startDate.replace(/-/g, '/').replace(/T. + /, '')
    )
    const newEndDate = new Date(endDate.replace(/-/g, '/').replace(/T. + /, ''))

    console.log('Ad Start Date:', newStartDate)
    console.log('Ad End Date:', newEndDate)

    try {
      await assignDates({
        id: parseInt(adId),
        start_date: newStartDate,
        end_date: newEndDate,
        store_ids: storeIds.map((id) => parseInt(id)),
      })

      setSuccess('Your ad has been successfully submitted!')
    } catch (error) {
      console.error('Error during playlist update verification:', error)
      setError(['An error occurred while verifying playlist updates.'])
    }
  }

  const resetForm = () => {
    setPreview(null)
    setFilePresent(null)
    setAdTitle('')
    setStartDate('')
    setEndDate('')
    setSelectedStores([])
    setCurrProducts([])
    setError([''])
    setSuccess('')
    setStoreComboboxValue([]) // Reset store combobox value
  }

  return (
    <div className="flex h-[85vh] justify-center p-8">
      <div className="mr-4 h-full w-5/6 rounded-lg bg-white p-6 shadow-lg">
        <form id="adForm" onSubmit={handleSubmit} className="flex h-full">
          <div className="flex w-2/5 flex-col space-y-5 pr-6">
            {/* File Upload Box */}
            <div
              className="flex flex-1 flex-col items-center justify-center rounded-lg bg-slate-300 2xl:mb-6"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <img
                src="/assets/upload.png"
                className="mb-2 h-12 w-auto 2xl:h-20"
              />
              {isDragActive ? (
                <p className="text-sm">Drop the files here ...</p>
              ) : (
                <p className="m-2 text-center text-sm 2xl:text-2xl">
                  Drag and drop or click to select your file
                </p>
              )}
            </div>
            {/* Preview Box */}
            <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-slate-300 p-2">
              {/* Inner Container for Preview */}
              <div className="flex h-full w-full items-center justify-center">
                {preview ? (
                  <img
                    src={preview.toString()}
                    className="max-h-full max-w-full object-contain"
                    alt="Preview"
                  />
                ) : (
                  <div>
                    <img
                      src="/assets/preview.png"
                      className="mx-auto mb-1 h-16 w-auto 2xl:h-24"
                    />
                    <p className="text-sm 2xl:text-2xl">
                      Your ad will show here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center space-y-3 p-2 2xl:space-y-6">
            {/* Ad Title */}
            <div>
              <label className="mb-1 block text-sm 2xl:text-2xl">
                Ad Title
              </label>
              <Input
                type="text"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 text-sm"
                placeholder="Enter a descriptive title here"
              />
            </div>
            {/* Products */}
            <div>
              <label className="mb-1 block text-sm 2xl:text-2xl">
                Products
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {currProducts.length > 0
                      ? currProducts.map((productId, index) => {
                          const productName = products.find(
                            (p) => p.id === productId
                          )?.name
                          return (
                            <Fragment key={productId}>
                              {productName}
                              {index < currProducts.length - 1 && ', '}
                            </Fragment>
                          )
                        })
                      : 'Select product/s'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search for a product type" />
                    <CommandEmpty>No product type found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {products.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={(selectProduct) => {
                              const productId = products.find(
                                (p) => p.name === selectProduct
                              )?.id

                              if (productId) {
                                const updatedProductIds = currProducts.includes(
                                  productId
                                )
                                  ? currProducts.filter(
                                      (id) => id !== productId
                                    )
                                  : [...currProducts, productId]

                                setCurrProducts(updatedProductIds)
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                currProducts.includes(product.id)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {product.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* Date Range */}
            <div>
              <label className="mb-1 block text-sm 2xl:text-2xl">
                Select Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 rounded border border-gray-300 p-2 text-sm"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 rounded border border-gray-300 p-2 text-sm"
                />
              </div>
            </div>
            {/* Store Selection */}
            <div>
              <label className="mb-1 block text-sm 2xl:text-2xl">
                Store Selection
              </label>
              <StoreComboboxUA
                onChange={(stores) => {
                  setSelectedStores(stores)
                  setStoreComboboxValue(stores) // Update state to reflect selected stores
                }}
                stored={stores}
                value={storeComboboxValue} // Bind the combobox to the state
              />
            </div>
            {/* Submit Button */}
            <div className="flex w-full justify-end">
              <Button
                type="submit"
                form="adForm"
                className="mt-10 bg-logoblue px-8 py-2 text-sm"
              >
                Submit
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const UploadAd = () => {
  const [error, setError] = useState<string[]>([])

  return (
    <div className="overflow-x-hidden">
      <div className="flex min-h-screen w-screen flex-col overflow-hidden bg-slate-50">
        <Navbar />
        <div className="justify-center pt-20 2xl:pt-28">
          <div className="flex justify-center">
            {error.length > 0 && (
              <div className="mt-4 w-5/6 space-y-2 rounded border border-red-300 bg-red-50 p-4 text-red-700">
                <div className="flex items-center space-x-2">
                  <MdErrorOutline />
                  <p className="text-sm font-medium">
                    Please fix the following errors:
                  </p>
                </div>
                <ul className="list-inside list-disc space-y-1">
                  {error.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <FileUpload setError={setError} />
        </div>
        <Toaster />
      </div>
      <Footer />
    </div>
  )
}

export default UploadAd
