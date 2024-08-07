import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FaChevronCircleUp, FaChevronCircleDown } from 'react-icons/fa'
import { LuSend } from 'react-icons/lu'
import ReactMarkdown from 'react-markdown'
import { useChatStore } from '../store.ts' // Adjust path accordingly
import { ThreeDots } from 'react-loader-spinner'

const Home: React.FC = () => {
  const [userMessage, setUserMessage] = useState<string>('')
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [showButtons, setShowButtons] = useState<boolean>(false)
  const chatContentRef = useRef<HTMLDivElement>(null)
  const { history, setChatHistory } = useChatStore()

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch(
          `https://us-central1-burner-liajacob.cloudfunctions.net/initChatFunction`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to initialize chat')
        }

        const result = await response.json()
        setChatHistory(result)
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }
    console.log(history)
    if (history.length == 0) {
      initializeChat()
    }
  }, [setChatHistory])

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight
    }

    setShowButtons(history.length === 2)
  }, [history, isStreaming])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value)
  }

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    setIsStreaming(true)

    try {
      const requestBody = JSON.stringify({ message: userMessage, history })

      const response = await fetch(
        `https://us-central1-burner-liajacob.cloudfunctions.net/sendChatFunction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, history }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const result = await response.json()
      setChatHistory(result.history)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsStreaming(false)
      setUserMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const suggestProducts = async () => {
    setIsStreaming(true)
    try {
      const response = await fetch(
        `https://us-central1-burner-liajacob.cloudfunctions.net/suggestProductFunction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to generate content')
      }
      const result = await response.json()
      setChatHistory(result)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  const suggestLocations = async () => {
    setIsStreaming(true)
    try {
      const response = await fetch(
        `https://us-central1-burner-liajacob.cloudfunctions.net/suggestLocationFunction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to generate content')
      }
      const result = await response.json()
      setChatHistory(result)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  const suggestDates = async () => {
    setIsStreaming(true)
    try {
      const response = await fetch(
        `https://us-central1-burner-liajacob.cloudfunctions.net/suggestDateFunction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to generate content')
      }
      const result = await response.json()
      setChatHistory(result)
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="overflow-x-hidden">
      <div className="h-min-screen h-screen bg-slate-50">
        <div
          className={`flex h-full w-screen flex-col overflow-hidden ${isStreaming ? 'cursor-wait' : ''}`}
        >
          <Navbar />
          <div className="bg-slate-50 pb-8 pt-28 2xl:pt-40">
            <Card className="mx-auto my-auto flex h-screen-3/4 w-2/3 flex-col">
              <CardHeader className="rounded-lg bg-logoblue text-white">
                <CardTitle>Ask Albert</CardTitle>
                <CardDescription className="text-white">
                  I'm here to help you with ideas for products, locations, and
                  dates for your ads.
                </CardDescription>
              </CardHeader>
              <CardContent
                ref={chatContentRef}
                className="w-full flex-1 space-y-4 overflow-y-auto p-4"
              >
                {history.slice(1).map((message, index) => (
                  <div
                    key={index}
                    className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'model' && (
                      <div className="flex w-full items-end">
                        <img
                          src="/assets/albert.png"
                          alt="Albert"
                          className="mr-2 inline-block h-6 w-fit 2xl:h-8"
                        />
                        <div className="max-w-[60%] rounded-lg bg-slate-100 p-3 text-slate-800 2xl:text-xl">
                          <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex w-full justify-end">
                        <div className="max-w-[50%] rounded-lg bg-slate-100 p-3 text-slate-800 2xl:text-xl">
                          <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-center py-4">
                    <ThreeDots
                      height="80"
                      width="80"
                      radius="9"
                      color="black"
                      ariaLabel="loading"
                      wrapperStyle={{}}
                      wrapperClass=""
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full flex-col">
                  <div className="relative">
                    {showButtons && (
                      <div
                        className={`mb-2 mt-3 flex justify-evenly transition-transform ${showButtons ? 'animate-fade-in' : 'animate-fade-out'}`}
                      >
                        <button
                          className="w-1/4 rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover 2xl:text-xl"
                          onClick={suggestProducts}
                        >
                          Suggest Products
                        </button>
                        <button
                          className="w-1/4 rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover 2xl:text-xl"
                          onClick={suggestLocations}
                        >
                          Suggest Locations
                        </button>
                        <button
                          className="w-1/4 rounded-lg bg-logoblue p-2 px-2 text-slate-100 transition-colors hover:bg-logobluehover 2xl:text-xl"
                          onClick={suggestDates}
                        >
                          Suggest Dates
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Input
                      type="text"
                      className="my-2 w-full rounded-2xl border border-slate-300 px-3 py-2 outline-none 2xl:h-12 2xl:text-xl"
                      placeholder="Enter your message..."
                      value={userMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={isStreaming}
                    />
                    <button
                      className="ml-2 rounded-full bg-slate-300 p-2 text-slate-700 transition-colors hover:bg-slate-200"
                      onClick={() => handleSendMessage()}
                    >
                      <LuSend size={26} />
                    </button>
                    <button
                      className="ml-2 rounded-full bg-slate-300 p-2 text-slate-700 transition-colors hover:bg-slate-200"
                      onClick={() => setShowButtons(!showButtons)}
                    >
                      {showButtons ? (
                        <FaChevronCircleDown size={26} />
                      ) : (
                        <FaChevronCircleUp size={26} />
                      )}
                    </button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
