import { PER_PAGE, UPDATE_EVENT } from './constants.js'
import { render } from './html-renderer.js'
import { fetchPosts, fetchUser } from './queries.js'

const state = {
  posts: [],
  users: [],
  page: 1,
  filterText: '',
  error: '',
  isLoading: true,
  isFilterUpdated: false,
  isAllPostsLoaded: false,
}

const eventHandlers = {
  onTextChange: async (text) => {
    if (state.filterText !== text) {
      state.isFilterUpdated = true
      state.isAllPostsLoaded = false
    }
    state.page = 1
    state.error = ''
    state.filterText = text
    state.isLoading = true

    window.dispatchEvent(new Event(UPDATE_EVENT))

    let newPosts = []

    try {
      newPosts = await fetchPosts({
        filterText: text,
        page: state.page,
        perPage: PER_PAGE,
      })
      await loadUsers(state, newPosts)
    } catch (error) {
      state.error = error
    } finally {
      state.isLoading = false
    }

    state.posts = state.isFilterUpdated
      ? newPosts
      : [...state.posts, ...newPosts]
    state.mergedUsersWithPosts = mergeUsersWithPosts(state.posts, state.users)

    if (newPosts.length > 0) {
      window.dispatchEvent(new Event(UPDATE_EVENT))
    } else {
      state.isAllPostsLoaded = true
    }

    window.dispatchEvent(new Event(UPDATE_EVENT))
  },
  onScroll: async () => {
    if (state.isAllPostsLoaded || state.isLoading) {
      return
    }

    state.isFilterUpdated = false
    state.error = ''
    state.isLoading = true
    if (!state.isAllPostsLoaded) {
      state.page += 1
    }

    let newPosts = []

    try {
      const options = {
        page: state.page,
        perPage: PER_PAGE,
      }
      if (state.filterText) {
        options.filterText = state.filterText
      }

      newPosts = await fetchPosts(options)
      await loadUsers(state, newPosts)
    } catch (error) {
      state.error = error
    } finally {
      state.isLoading = false
    }

    if (newPosts.length > 0) {
      state.posts.push(...newPosts)
      state.mergedUsersWithPosts = mergeUsersWithPosts(state.posts, state.users)
      window.dispatchEvent(new Event(UPDATE_EVENT))
    } else {
      state.isAllPostsLoaded = true
    }
  },
}

async function loadUsers(state, newPosts) {
  const { users } = state

  for (let i = 0; i < newPosts.length; i++) {
    const post = newPosts[i]
    const user = users.find((user) => user.id === post.userId)

    if (!user) {
      users.push(await fetchUser(post.userId))
    }
  }
}

function mergeUsersWithPosts(posts, users) {
  console.log({ posts, users })
  const mergedUsers = []

  users.forEach((user) => {
    const userPosts = posts.filter((post) => post.userId === user.id)
    if (userPosts.length > 0) {
      mergedUsers.push({
        ...user,
        posts: userPosts,
      })
    }
  })

  return mergedUsers
}

eventHandlers.onTextChange('')

window.addEventListener(UPDATE_EVENT, () => {
  render(state, eventHandlers)
})

window.dispatchEvent(new Event(UPDATE_EVENT))
