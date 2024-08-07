import React, { useEffect, useState, FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BackButton from '@/components/BackButton'
import ProductViewAdCombobox from '@/components/ProductViewAdCombobox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import useAdStore, {
  Ad,
  Product,
  Store,
  fetchAd,
  fetchAdDates,
  fetchAdStores,
  fetchProducts,
  updateAdDetails,
  updateAdDates,
} from '@/store'
import moment from 'moment'

const ViewAd: React.FC = () => {
  const { ad, setAdDetails, clearAd } = useAdStore((state) => state)
  const { id } = useParams<{ id: string }>()
  const adId = id ? parseInt(id, 10) : -1

  const [currAd, setCurrAd] = useState<Ad>()
  const [products, setProducts] = useState<Product[]>([])
  const [_, setStores] = useState<Store[]>([])
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [editStart, setEditStart] = useState<string>('')
  const [editEnd, setEditEnd] = useState<string>('')

  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState<boolean>(false)

  // FETCH AD DETAILS
  const getAd = async (adId: number) => {
    try {
      const ad = await fetchAd(adId)
      setCurrAd(ad)
      setError(null)
      return ad
    } catch {
      setError('Ad not found')
    }
  }

  const getAdProducts = async (ad: Ad) => {
    try {
      const products = await fetchProducts(ad.product_ids)
      setProducts(products)
    } catch {
      setProducts([])
    }
  }

  const getAdDates = async (adId: number) => {
    try {
      const adDates = await fetchAdDates(adId)
      setStartDate(adDates.start_date)
      setEndDate(adDates.end_date)
    } catch {
      console.error(error)
    }
  }

  const getAdStores = async (adId: number) => {
    try {
      const adStores: Store[] = await fetchAdStores(adId)
      setStores(adStores.sort())
    } catch {
      console.error(error)
    }
  }

  // DISPLAY DATES
  const handleDateDisplay = () => {
    if (!startDate || !endDate) {
      return 'N/A'
    }

    const start = moment(startDate)
    const end = moment(endDate)

    if (start.isSame(end, 'day')) {
      return start.format('MMM D, YYYY')
    } else if (start.isSame(end, 'month')) {
      return `${start.format('MMM D')} - ${end.format('D, YYYY')}`
    } else if (start.isSame(end, 'year')) {
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`
    } else {
      return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`
    }
  }

  const dateFormat = (date: Date) => {
    return moment(date).format('YYYY-MM-DD')
  }

  // DEALING WITH EDITS
  const handleProductsChange = (newProducts: Product[]) => {
    setAdDetails({
      product_ids: newProducts.map((product: Product) => product.id),
    })
    setProducts(newProducts)
  }

  // BUTTONS
  const handleEditClick = () => {
    setAdDetails({
      title: currAd?.title,
      product_ids: currAd?.product_ids,
    })
    if (startDate) {
      setEditStart(dateFormat(startDate))
    }
    if (endDate) {
      setEditEnd(dateFormat(endDate))
    }
    setIsEditing(true)
  }

  const handleCancelClick = async (): Promise<void> => {
    setIsEditing(false)
    clearAd
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    let isAdUpdated = false
    const formData = new FormData()

    // Check if ad data changed
    if (ad.title !== currAd?.title) {
      formData.append('title', ad.title)
    }
    if (ad.product_ids !== currAd?.product_ids) {
      formData.append('product_ids', JSON.stringify(ad.product_ids))
    }
    if (Array.from(formData.entries()).length > 0) {
      try {
        await updateAdDetails(adId, formData)
        isAdUpdated = true
      } catch (error) {
        isAdUpdated = false
        console.error('Failed to update ad details')
      }
    }

    const newStart: Date = new Date(
      editStart.replace(/-/g, '/').replace(/T.+/, '')
    )
    const newEnd: Date = new Date(editEnd.replace(/-/g, '/').replace(/T.+/, ''))
    if (newStart !== startDate || newEnd !== endDate) {
      try {
        await updateAdDates({
          id: adId,
          start_date: newStart,
          end_date: newEnd,
        })
        isAdUpdated = true
      } catch (error) {
        isAdUpdated = false
        console.error('Failed to update ad dates')
      }
    }

    if (isAdUpdated) {
      setRefresh(true)
    } else {
      setError('Failed to update ad details')
    }

    setIsEditing(false)
    clearAd
  }

  // SET AD DETAILS FOR PAGE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ad = await getAd(adId)
        if (ad) {
          try {
            await getAdProducts(ad)
          } catch (error) {
            console.error(error)
            setError('Failed to find ad products')
          }

          try {
            await getAdDates(adId)
          } catch (error) {
            console.error(error)
            setError('Failed to find ad dates')
          }

          try {
            await getAdStores(adId)
          } catch (error) {
            console.error(error)
            setError('Failed to find ad stores')
          }
        }
      } catch (error) {
        console.error(error)
        setError('Failed to display ad details')
      }
    }

    fetchData()
    setRefresh(false)
  }, [adId, refresh])

  if (error) {
    return (
      <div>
        <div className="flex w-screen flex-col overflow-hidden">
          <Navbar />
          <div className="flex flex-row">
            <BackButton />
          </div>
          <div className="mb-10 mt-10 flex items-center justify-center text-4xl">
            Ad not found
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50">
        <Navbar />
        <div className="flex flex-grow flex-col items-center bg-slate-50 pt-16 2xl:pt-24">
          <div className="flex w-full justify-between px-4 py-2">
            <div className="flex-shrink-0">
              <BackButton />
            </div>
            <div className="flex-grow" />
          </div>
          <div className="-pt-6 flex flex-grow flex-col items-center justify-start">
            <div className="w-[60vw] 2xl:text-2xl">
              <form
                id="updateAdForm"
                onSubmit={handleSubmit}
                className="my-6 rounded-lg bg-white p-6 shadow-lg shadow-slate-300"
              >
                <div className="flex h-96 flex-row items-center justify-evenly overflow-x-hidden">
                  <img src={currAd?.image} className="h-5/6" />
                  <div className="overflow-wrap flex h-5/6 w-1/3 flex-col content-center justify-evenly">
                    <div className="mb-4 flex flex-col">
                      {isEditing ? (
                        <Input
                          type="text"
                          name="title"
                          value={currAd?.title}
                          onChange={(e) =>
                            setAdDetails({ title: e.target.value })
                          }
                          className="text-2xl font-semibold 2xl:text-4xl"
                        />
                      ) : (
                        <h1 className="text-2xl font-semibold 2xl:text-4xl">
                          {currAd?.title}
                        </h1>
                      )}
                    </div>
                    <div className="flex flex-row">
                      <b>Product:&ensp;</b>
                      {isEditing ? (
                        <ProductViewAdCombobox
                          onProductsChange={handleProductsChange}
                          checkedProducts={products}
                          comboboxLabel={'Select'}
                        />
                      ) : (
                        <div>
                          {currAd?.product_ids.length === 0
                            ? 'N/A'
                            : products
                                ?.sort((a, b) => a.name.localeCompare(b.name))
                                .map((product) => product.name)
                                .join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row">
                      <b>Dates:&ensp;</b>
                      {isEditing ? (
                        <div>
                          <div className="flex space-x-2">
                            <input
                              type="date"
                              name="startDate"
                              value={editStart}
                              onChange={(e) => setEditStart(e.target.value)}
                              className="w-1/2 rounded border border-gray-300 p-1 text-sm"
                            />
                            <label>-</label>
                            <input
                              type="date"
                              name="endDate"
                              value={editEnd}
                              onChange={(e) => setEditEnd(e.target.value)}
                              className="w-1/2 rounded border border-gray-300 p-1 text-sm"
                            />
                          </div>
                        </div>
                      ) : (
                        <>{handleDateDisplay()}</>
                      )}
                    </div>
                    <div className="flex flex-row">
                      <b>Stores:&ensp;</b>
                    </div>
                    <p>
                      <b>Status:&ensp;</b>
                      {currAd?.ad_status === 'scheduled'
                        ? 'Scheduled'
                        : 'Archived'}
                    </p>

                    {/* Edit/Save Buttons */}
                    <div className="mt-2 flex flex-row">
                      {isEditing ? (
                        <div className="flex-row">
                          <Button className="mr-3" onClick={handleCancelClick}>
                            Cancel
                          </Button>
                          <Button type="submit">Save</Button>
                        </div>
                      ) : (
                        <button
                          className="bg-transparent text-black"
                          onClick={handleEditClick}
                        >
                          <span className="flex items-center">
                            <img
                              src="/assets/pencil.png"
                              className="h-5 2xl:h-7"
                              alt="Edit Icon"
                            />
                            &ensp;Edit Ad
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ViewAd
