import * as React from 'react'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import Button from '@mui/material/Button'
import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
} from '@table-library/react-table-library/table'
import { useSort } from '@table-library/react-table-library/sort'
import ky from 'ky'
import { getCookie } from 'typescript-cookie'
import { useNavigate } from 'react-router-dom'

// Define TypeScript interfaces for node data
interface Ad {
  id: number
  title: string
}

interface AdDate {
  start_date: string
  end_date: string
}

interface SchedulerDataListProps {
  ads: Ad[]
}

const SchedulerDataList: React.FC<SchedulerDataListProps> = ({ ads }) => {
  const data: Ad[] = ads
  const [dates, setDates] = React.useState<{ [key: number]: AdDate }>({})
  const [loading, setLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const navigate = useNavigate()

  React.useEffect(() => {
    console.log('ads', ads)

    const fetchDates = async () => {
      setLoading(true)
      try {
        const datePromises = ads.map((ad) =>
          ky
            .get(
              `https://backend-latest-8krk.onrender.com/api/ads/get-dates/${ad.id}`,
              {
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${getCookie('token')}`,
                },
              }
            )
            .json<AdDate>()
        )

        const dateResults = await Promise.all(datePromises)
        const dateMap = ads.reduce(
          (acc, ad, index) => {
            acc[ad.id] = dateResults[index]
            return acc
          },
          {} as { [key: number]: AdDate }
        )

        setDates(dateMap)
      } catch (error) {
        console.error('Failed to fetch dates:', error)
        setError('Failed to load dates.')
      } finally {
        setLoading(false)
      }
    }

    fetchDates()
  }, [ads])

  // Sort functionality
  const sort = useSort(
    { nodes: data },
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
        AD_ID: (array) => array.sort((a: any, b: any) => a.id - b.id),
        AD_NAME: (array) =>
          array.sort((a, b) => a.title.localeCompare(b.title)),
        START_DATE: (array) =>
          array.sort((a: any, b: any) => {
            const dateA = new Date(dates[a.id]?.start_date || 0)
            const dateB = new Date(dates[b.id]?.start_date || 0)
            return dateA.getTime() - dateB.getTime()
          }),
        END_DATE: (array) =>
          array.sort((a: any, b: any) => {
            const dateA = new Date(dates[a.id]?.end_date || 0)
            const dateB = new Date(dates[b.id]?.end_date || 0)
            return dateA.getTime() - dateB.getTime()
          }),
      },
    }
  )

  function onSortChange(action: any, state: any) {
    console.log(action, state)
  }

  const getIcon = (sortKey: string) => {
    if (sort.state.sortKey === sortKey && sort.state.reverse) {
      return <KeyboardArrowDownOutlinedIcon />
    }
    if (sort.state.sortKey === sortKey && !sort.state.reverse) {
      return <KeyboardArrowUpOutlinedIcon />
    }
    return <UnfoldMoreOutlinedIcon />
  }

  const handleViewAd = (adId: number) => {
    navigate(`/view/${adId}`)
  }

  const cellStyle = {
    textAlign: 'left',
    padding: '10px', // Adds padding inside the cells
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <ThemeProvider theme={createTheme({})}>
      <Table data={{ nodes: data }} sort={sort}>
        {(tableList: Ad[]) => (
          <>
            <Header>
              <HeaderRow>
                <HeaderCell>
                  <Button
                    fullWidth
                    style={{ justifyContent: 'flex-start' }}
                    endIcon={getIcon('AD_NAME')}
                    onClick={() =>
                      sort.fns.onToggleSort({ sortKey: 'AD_NAME' })
                    }
                  >
                    Ad Name
                  </Button>
                </HeaderCell>
                <HeaderCell>
                  <Button
                    fullWidth
                    style={{ justifyContent: 'flex-start' }}
                    endIcon={getIcon('AD_ID')}
                    onClick={() => sort.fns.onToggleSort({ sortKey: 'AD_ID' })}
                  >
                    Ad ID
                  </Button>
                </HeaderCell>
                <HeaderCell>
                  <Button
                    fullWidth
                    style={{ justifyContent: 'flex-start' }}
                    endIcon={getIcon('START_DATE')}
                    onClick={() =>
                      sort.fns.onToggleSort({ sortKey: 'START_DATE' })
                    }
                  >
                    Start Date
                  </Button>
                </HeaderCell>
                <HeaderCell>
                  <Button
                    fullWidth
                    style={{ justifyContent: 'flex-start' }}
                    endIcon={getIcon('END_DATE')}
                    onClick={() =>
                      sort.fns.onToggleSort({ sortKey: 'END_DATE' })
                    }
                  >
                    End Date
                  </Button>
                </HeaderCell>
                <HeaderCell>
                  {/* Empty header cell for the View Ad button */}
                </HeaderCell>
              </HeaderRow>
            </Header>
            <Body>
              {tableList.map((item: Ad) => {
                const adDates = dates[item.id] || {
                  start_date: 'N/A',
                  end_date: 'N/A',
                }
                const startDate = formatDate(adDates.start_date)
                const endDate = formatDate(adDates.end_date)
                return (
                  <Row item={item} key={item.id}>
                    <Cell style={cellStyle}>{item.title}</Cell>
                    <Cell style={cellStyle}>{item.id}</Cell>
                    <Cell style={cellStyle}>{startDate}</Cell>
                    <Cell style={cellStyle}>{endDate}</Cell>
                    <Cell style={cellStyle}>
                      <button
                        onClick={() => handleViewAd(item.id)}
                        className="rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover"
                      >
                        View/Edit
                      </button>
                    </Cell>
                  </Row>
                )
              })}
            </Body>
          </>
        )}
      </Table>
    </ThemeProvider>
  )
}

export default SchedulerDataList
