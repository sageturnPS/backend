import { create, StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getCookie, setCookie, removeCookie } from 'typescript-cookie'
import ky from 'ky'

// Type definitions
export type User = {
  id: string
  first_name: string
  last_name: string
  role: string
  profile_photo: string
  is_auth: boolean
  preferred_store: Store
}

export type Ad = {
  id: number
  title: string
  date_created: Date
  image: string
  ad_status: 'scheduled' | 'archived'
  product_ids: number[]
}

export type Product = {
  id: number
  name: string
  category: string
}

export type Playlist = {
  id: number
  date: Date
  store_id: number
}

export type Store = {
  id: number
  name: string
  address: string
  state: string
  banner: string
}

type userState = {
  currentUser: User | null
  loggedIn: boolean

  login: (username: string, password: string) => Promise<User | undefined>
  logout: () => void
  getProfile: () => void
  // setPreferredStore: (newStore: Store) => void
}

type AdState = {
  ad: {
    title: string
    product_ids: number[] // Ensure product_ids is typed as number[]
    gen_options: string[]
    text: string | null
    image: string
  }
  setAdDetails: (details: Partial<AdState['ad']>) => void
  setText: (text: string) => void
  setImage: (image: string) => void
  clearAd: () => void
}

const userStore: StateCreator<userState, [['zustand/persist', unknown]]> = (
  set,
  _
) => ({
  currentUser: {
    id: '',
    first_name: '',
    last_name: '',
    role: '',
    profile_photo: '',
    is_auth: false,
    preferred_store: {
      id: 1,
      name: '',
      address: '',
      state: '',
      banner: '',
    },
  },
  loggedIn: false,
  login: async (
    username: string,
    password: string
  ): Promise<User | undefined> => {
    try {
      const response = await ky
        .post('https://backend-latest-8krk.onrender.com/api/user/login', {
          json: { username, password },
        })
        .json<{ token: string; user: User }>()

      // Store the token in a cookie
      setCookie('token', response.token, { expires: 1 })
      console.log(getCookie('token'))

      // Set the current user and the login
      set({ currentUser: response.user, loggedIn: true })

      console.log('Login successful')
      return response.user
    } catch (e) {
      console.error('Failed to login', e)
    }
  },

  logout: async () => {
    try {
      await ky.post(
        'https://backend-latest-8krk.onrender.com/api/user/logout',
        {
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        }
      )

      removeCookie('token', { path: '' })

      set({ currentUser: null, loggedIn: false })
      useChatStore.getState().clearChat()
      console.log('Successfully Logged Out')
    } catch (error) {
      console.error('Failed to logout', error)
    }
  },

  getProfile: async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1]
      if (!token) {
        throw new Error('No token found')
      }

      const response = await ky
        .get('https://backend-latest-8krk.onrender.com/api/user/profile', {
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        })
        .json<User>()

      set({ currentUser: response })
    } catch (e) {
      console.error('Failed to get profile', e)
    }
  },

  //   setPreferredStore: (newStore: Store) => {
  //     set((state) => ({
  //       currentUser: state.currentUser
  //         ? { ...state.currentUser, preferred_store: newStore }
  //         : state.currentUser,
  //     }))
  //   },
})

const adStore: StateCreator<AdState, [['zustand/persist', unknown]]> = (
  set,
  _
) => ({
  ad: {
    title: '',
    product_ids: [], // Initialize product_ids as an empty array of number
    gen_options: [],
    text: null,
    image: '',
  },
  setAdDetails: (details: Partial<AdState['ad']>) =>
    set((state) => ({
      ad: {
        ...state.ad,
        ...details,
        product_ids: details.product_ids ?? state.ad.product_ids,
      },
    })),
  setText: (text: string) =>
    set((state) => ({
      ad: { ...state.ad, text },
    })),
  setImage: (image: string) =>
    set((state) => ({
      ad: { ...state.ad, image },
    })),
  clearAd: () =>
    set({
      ad: {
        title: '',
        product_ids: [],
        gen_options: [],
        text: null,
        image: '',
      },
    }),
})

const useUserStore = create(
  persist(userStore, {
    name: 'user-state',
    storage: createJSONStorage(() => localStorage),
  })
)

const useAdStore = create(
  persist(adStore, {
    name: 'ad-state',
    storage: createJSONStorage(() => localStorage),
  })
)

type ChatMessage = {
  role: 'user' | 'model'
  parts: { text: string }[]
}

type ChatHistory = ChatMessage[]

type ChatState = {
  history: ChatHistory

  setChatHistory: (newHistory: ChatHistory) => void
  clearChat: () => void
}

const chatStore: StateCreator<ChatState, [['zustand/persist', unknown]]> = (
  set,
  _
) => ({
  history: [],

  setChatHistory: (newHistory: ChatHistory) => set({ history: newHistory }),

  clearChat: () => set({ history: [] }),
})

const useChatStore = create(
  persist(chatStore, {
    name: 'chat-state',
    storage: createJSONStorage(() => localStorage),
  })
)

export default useAdStore
export { useUserStore, useChatStore }

// PRODUCT FUNCTIONS
export const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const response = await ky
      .get(
        `https://backend-latest-8krk.onrender.com/api/products/get-id/${id}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
        }
      )
      .json<Product>()

    const product: Product = response

    return product
  } catch (error) {
    throw new Error('Product not found')
  }
}

export const fetchProducts = async (
  productIds: number[]
): Promise<Product[]> => {
  try {
    const products: Product[] = []
    productIds.forEach((productId) => {
      fetchProductById(productId)
        .then((product) => {
          products.push(product)
        })
        .catch((error) => {
          throw error
        })
    })
    return products
  } catch {
    throw new Error('Failed to fetch ad products')
  }
}

// STORE FUNCTIONS
export const fetchAdStores = async (adId: number): Promise<Store[]> => {
  try {
    const stores = await ky
      .get(`https://backend-latest-8krk.onrender.com/api/stores/ad/${adId}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
      })
      .json<Store[]>()
    return stores
  } catch {
    throw new Error('Failed to fetch ad stores')
  }
}

// AD FUNCTIONS
export const fetchAd = async (id: number): Promise<Ad> => {
  try {
    const response = await ky
      .get(`https://backend-latest-8krk.onrender.com/api/ads/get-id/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('token')}`,
        },
      })
      .json<Ad>()
    return response
  } catch {
    throw new Error('Ad not found')
  }
}

export const fetchAdDates = async (
  id: number
): Promise<{ start_date: Date; end_date: Date }> => {
  try {
    const response = await ky
      .get(`https://backend-latest-8krk.onrender.com/api/ads/get-dates/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('token')}`,
        },
      })
      .json<{ start_date: Date; end_date: Date }>()

    const data = await response

    const start_date = new Date(data.start_date)
    const end_date = new Date(data.end_date)

    const dates = {
      start_date,
      end_date,
    }

    return dates
  } catch {
    throw new Error('Failed to fetch ad dates')
  }
}

// AD DATES
export const assignDates = async ({
  id,
  start_date,
  end_date,
  store_ids,
}: {
  id: number
  start_date: Date
  end_date: Date
  store_ids?: number[]
}): Promise<void> => {
  try {
    const queryData: {
      start_date: Date
      end_date: Date
      store_ids?: number[]
    } = {
      start_date: start_date,
      end_date: end_date,
    }

    if (store_ids) {
      queryData.store_ids = store_ids
    }

    await ky
      .post(
        `https://backend-latest-8krk.onrender.com/api/ads/assign-dates/${id}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
          body: JSON.stringify(queryData),
        }
      )
      .json()
  } catch (error) {
    throw error
  }
}

const removeDates = async ({
  id,
  start_date,
  end_date,
}: {
  id: number
  start_date: Date
  end_date: Date
}): Promise<void> => {
  try {
    const queryData = {
      start_date: start_date,
      end_date: end_date,
    }

    await ky
      .post(
        `https://backend-latest-8krk.onrender.com/api/ads/remove-dates/${id}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getCookie('token')}`,
          },
          body: JSON.stringify(queryData),
        }
      )
      .json()
  } catch (error) {
    throw error
  }
}

export const updateAdDates = async ({
  id,
  start_date,
  end_date,
}: {
  id: number
  start_date: Date
  end_date: Date
}): Promise<void> => {
  try {
    const params = { id, start_date, end_date }
    await assignDates(params)
    await removeDates(params)
  } catch (error) {
    throw error
  }
}

// UPDATE AD DETAILS
export const updateAdDetails = async (
  id: number,
  formData: FormData
): Promise<void> => {
  try {
    await ky
      .put(`https://backend-latest-8krk.onrender.com/api/ads/update/${id}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
        body: formData,
      })
      .json()
  } catch (error) {
    throw error
  }
}
