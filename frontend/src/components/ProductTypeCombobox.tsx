import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ky from 'ky'
import { getCookie } from 'typescript-cookie' // Adjust the import path as necessary

interface Product {
  id: number
  name: string
  category: string
}

interface Props {
  onChange: (product: Product | null) => void;
  
}

const ProductTypeCombobox: React.FC<Props> = ({ onChange }) => {
  const [open, setOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  )
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch products on component mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await ky
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
        setProducts(response)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        setError('Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Handle selection of product type
  const handleProductTypeSelect = (product: Product) => {
    const newProduct = product === selectedProduct ? null : product // Toggle selection
    setSelectedProduct(newProduct)
    onChange(newProduct) // Pass product or null to parent component
    setOpen(false) // Close the popover after selection
  }

  return (
    <div className="flex flex-col">
      <label>Product type</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedProduct ? selectedProduct.name : 'Select product'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search for a product type" />
            <CommandEmpty>No product type found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {loading ? (
                  <CommandItem>Loading...</CommandItem>
                ) : error ? (
                  <CommandItem>{error}</CommandItem>
                ) : (
                  products.map((product) => (
                    <CommandItem
                      key={product.id}
                      onSelect={() => handleProductTypeSelect(product)}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          product === selectedProduct
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                      />
                      {product.name}
                    </CommandItem>
                  ))
                )}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ProductTypeCombobox
