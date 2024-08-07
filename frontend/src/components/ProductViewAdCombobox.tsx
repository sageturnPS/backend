import * as React from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import { Product } from '@/store'
import ky from 'ky'
import { getCookie } from 'typescript-cookie'

interface Props {
  onProductsChange: (products: Product[]) => void
  checkedProducts: Product[]
  comboboxLabel: string
}

const ProductTypeCombobox: React.FC<Props> = ({
  onProductsChange,
  comboboxLabel,
  checkedProducts,
}) => {
  const [open, setOpen] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [currProducts, setCurrProducts] = React.useState<Product[]>([])

  // Retrieve all products
  const setComboBox = async () => {
    try {
      const response = await ky
        .get('https://backend-latest-8krk.onrender.com/api/products/get-all', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        })
        .json<Product[]>()
      setProducts(response.sort((a, b) => a.name.localeCompare(b.name)))
      setCurrProducts(checkedProducts)
    } catch (error) {
      console.error('Error fetching products: ', error)
    }
  }

  const handleProductTypeSelect = (selectedProduct: Product) => {
    const isSelected = currProducts.some(
      (product) => product.name === selectedProduct.name
    )

    const updatedProducts = isSelected
      ? currProducts.filter((product) => product.name !== selectedProduct.name)
      : [...currProducts, selectedProduct].sort((a, b) =>
          a.name.localeCompare(b.name)
        )

    setCurrProducts(updatedProducts)
    onProductsChange(updatedProducts)
  }

  React.useEffect(() => {
    setComboBox()
  }, [])

  return (
    <div className="flex flex-col">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex w-[200px] items-center justify-between overflow-hidden text-ellipsis whitespace-nowrap"
            title={currProducts.map((product) => product.name).join(', ')}
          >
            <span className="flex-1">
              {currProducts.length > 0
                ? currProducts.map((product) => product.name).join(', ')
                : comboboxLabel}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search for a product type" />
            <CommandEmpty>No product type found.</CommandEmpty>
            <CommandGroup>
              <CommandList>
                {products.map((productType) => (
                  <CommandItem
                    key={productType.name}
                    value={productType.name}
                    onSelect={() => handleProductTypeSelect(productType)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        currProducts.some(
                          (product) => product.name === productType.name
                        )
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {productType.name}
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ProductTypeCombobox
