import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

interface SortDropdownProps {
  onChange: (sortBy: string, sortOrder: string) => void
}

function SortDropdown({ onChange }: SortDropdownProps) {
  const [sortBy, setSortBy] = React.useState('newest-to-oldest')
  const [_, setSortOrder] = React.useState('asc')

  const sortMethods = [
    // {
    //   value: "a-z",
    //   label: "A-Z",
    // },
    // {
    //   value: "z-a",
    //   label: "Z-A",
    // },
    {
      value: 'newest-to-oldest',
      label: 'Newest to Oldest',
    },
    {
      value: 'oldest-to-newest',
      label: 'Oldest to Newest',
    },
  ]

  // Handle sorting option change
  const handleSortChange = (newValue: string) => {
    setSortBy(newValue)

    // Determine sortOrder based on sortBy value
    let newSortOrder = 'asc'
    if (newValue === 'z-a' || newValue === 'oldest-to-newest') {
      newSortOrder = 'desc'
    }

    setSortOrder(newSortOrder)

    // Call parent onChange handler
    onChange(newValue, newSortOrder)
  }

  return (
    <div className="ml-3 mr-3 flex flex-col">
      <label>Sort by</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" role="dropdown">
            {sortBy
              ? sortMethods.find((sortMethod) => sortMethod.value === sortBy)
                  ?.label
              : 'Select sorting method'}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="right-0 w-56">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={sortBy}
            onValueChange={handleSortChange}
          >
            {sortMethods.map((sortMethod) => (
              <DropdownMenuRadioItem
                key={sortMethod.value}
                value={sortMethod.value}
              >
                {sortMethod.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default SortDropdown
