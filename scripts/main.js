import { PER_PAGE, UPDATE_EVENT } from './constants.js'
import { render } from './html-renderer.js'
import { fetchPosts, fetchUser } from './queries.js'

const state = {
  posts: [],
  cachedUsers: {},
  page: 1,
  filterText: '',
  error: '',
  loading: true,
}

const eventHandlers = {
  onTextChange: async (text) => {
    state.page = 1
    state.error = ''
    state.loading = true
    state.filterText = text
    window.dispatchEvent(new Event(UPDATE_EVENT))

    try {
      const newPosts = await fetchPosts({
        filterText: text,
        page: state.page,
        perPage: PER_PAGE,
      })
      await loadUsers(state, newPosts)
      state.posts = newPosts
    } catch (error) {
      state.error = error
    } finally {
      state.loading = false
    }

    window.dispatchEvent(new Event(UPDATE_EVENT))
  },
  onScroll: async () => {
    if (state.filterText) {
      return
    }

    state.page += 1
    state.error = ''
    let newPosts = []

    try {
      newPosts = await fetchPosts({
        page: state.page,
        perPage: PER_PAGE,
      })
      await loadUsers(state, newPosts)
    } catch (error) {
      state.error = error
    } finally {
      state.loading = false
    }

    if (newPosts.length > 0) {
      state.posts.push(...newPosts)
      window.dispatchEvent(new Event(UPDATE_EVENT))
    }
  },
}

async function loadUsers(state, newPosts) {
  const { cachedUsers } = state

  for (let i = 0; i < newPosts.length; i++) {
    const post = newPosts[i]

    if (!(post.userId in cachedUsers)) {
      cachedUsers[post.userId] = await fetchUser(post.userId)
    }
  }
}

eventHandlers.onTextChange('')

window.addEventListener(UPDATE_EVENT, () => {
  render(state, eventHandlers)
})

window.dispatchEvent(new Event(UPDATE_EVENT))
