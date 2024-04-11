import { API_URL } from './constants.js'

export const fetchUser = async (userId) => {
  if (!userId) {
    return
  }

  const response = await fetch(`${API_URL}/users/${userId}`)

  if (response.ok) {
    return await response.json()
  } else {
    if (response.status === 404) throw new Error('404, User was not found')
    if (response.status === 500) throw new Error('500, Internal server error')
    throw new Error(response.status)
  }
}

export const fetchPosts = async (options) => {
  const paginationParams = options?.page &&
    options?.perPage && {
      _page: options.page,
      _per_page: options.perPage,
    }
  const filterParams = options?.filterText && {
    title_like: options.filterText,
  }
  const queryString = new URLSearchParams({
    ...filterParams,
    ...paginationParams,
  }).toString()

  const response = await fetch(`${API_URL}/posts?${queryString}`)

  if (response.ok) {
    return await response.json()
  } else {
    if (response.status === 404) throw new Error('404, Posts were not found')
    if (response.status === 500) throw new Error('500, Internal server error')
    throw new Error(response.status)
  }
}
