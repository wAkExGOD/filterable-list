import { debounce } from './helpers.js'

let lastScrollPosition = 0

export function render(state, eventHandlers) {
  const { onTextChange, onScroll } = eventHandlers
  const { isLoading, error, posts } = state

  const userCardsWrapperEl = document.querySelector('.userCardsWrapper')
  const loadingEl = document.querySelector('.loading')
  const errorEl = document.querySelector('.error')

  errorEl.innerHTML = ''
  userCardsWrapperEl.innerHTML = ''

  if (isLoading) {
    return loadingEl.classList.remove('hidden')
  }

  loadingEl.classList.add('hidden')

  createFilter(state, onTextChange)

  if (error) {
    return (errorEl.innerHTML = error)
  }

  if (!posts || !posts.length) {
    const notification = createNoPostsNotification()
    return userCardsWrapperEl.appendChild(notification)
  }

  const userCardsListEl = createUserCards(state)

  userCardsWrapperEl.appendChild(userCardsListEl)

  createInfiniteScroll(onScroll, state)
  if (!state.isFilterUpdated) {
    window.scrollTo({
      top: lastScrollPosition,
    })
  }
}

function createFilter(state, onTextChange) {
  const filterWrapperEl = document.querySelector('.filterWrapper')
  const inputEl = document.createElement('input')

  filterWrapperEl.innerHTML = ''

  inputEl.classList.add('filter')
  inputEl.placeholder = 'Post title...'
  inputEl.value = state.filterText

  const handleSearch = debounce(async (e) => {
    await onTextChange(e.target.value)
  }, 500)
  inputEl.addEventListener('input', handleSearch)

  filterWrapperEl.appendChild(inputEl)
  inputEl.focus()
}

function createUserCards(state) {
  const userCardsListEl = document.createElement('ul')
  userCardsListEl.classList.add('userCards')

  state.mergedUsersWithPosts.map((user) => {
    const userCardEl = document.createElement('div')
    userCardEl.classList.add('userCard')

    const userCardInfoEl = document.createElement('div')
    userCardInfoEl.classList.add('userInfo')
    userCardInfoEl.innerHTML = `
      <p class="username">${user.name}</p>
      <p>${user.phone || '-'}</p>
      <p>${user.email || '-'}</p>
    `

    const userCardPostsEl = document.createElement('div')
    userCardPostsEl.classList.add('userPosts')

    user.posts.map((post) => {
      const postEl = document.createElement('div')
      const titleEl = document.createElement('h2')
      const textEl = document.createElement('p')
      postEl.classList.add('userPost')
      titleEl.textContent = post.title
      textEl.textContent = post.body

      postEl.appendChild(titleEl)
      postEl.appendChild(textEl)

      userCardPostsEl.appendChild(postEl)
    })

    userCardEl.appendChild(userCardInfoEl)
    userCardEl.appendChild(userCardPostsEl)

    userCardsListEl.appendChild(userCardEl)
  })

  return userCardsListEl
}

function createNoPostsNotification() {
  const noPostsDiv = document.createElement('div')
  noPostsDiv.classList.add('noPosts')
  noPostsDiv.textContent = 'Oops! 😅 No posts available at the moment'

  return noPostsDiv
}

function createInfiniteScroll(handleScroll, state) {
  if (state.isAllPostsLoaded || state.isLoading) {
    return
  }

  window.addEventListener('scroll', async () => {
    if (
      Math.ceil(window.innerHeight + window.scrollY) >=
      document.body.offsetHeight
    ) {
      lastScrollPosition = window.scrollY
      handleScroll()
    }
  })
}
