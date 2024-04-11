import { TABLE_HEADERS } from './constants.js'
import { debounce } from './helpers.js'

let lastScrollPosition = 0

export function render(state, eventHandlers) {
  const { onTextChange, onScroll } = eventHandlers
  const { loading, error, posts } = state

  const loadingEl = document.querySelector('.loading')
  const errorEl = document.querySelector('.error')
  const tableWrapperEl = document.querySelector('.tableWrapper')
  const tableEl = document.createElement('table')

  errorEl.innerHTML = ''
  tableWrapperEl.innerHTML = ''

  if (loading) {
    return loadingEl.classList.remove('hidden')
  }

  loadingEl.classList.add('hidden')

  createFilter(state, onTextChange)

  if (error) {
    return (errorEl.innerHTML = error)
  }

  if (!posts || !posts.length) {
    const notification = createNoPostsNotification()
    return tableWrapperEl.appendChild(notification)
  }

  createTableHeaders(tableEl, Object.keys(TABLE_HEADERS))
  createTableBody(tableEl, state)

  tableWrapperEl.appendChild(tableEl)

  createInfiniteScroll(onScroll)
  window.scrollTo({
    top: lastScrollPosition,
  })
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

function createTableHeaders(tableEl, headers) {
  const theadEl = document.createElement('thead')
  const rowEl = document.createElement('tr')

  headers.forEach((header) => {
    const tdEl = document.createElement('th')
    tdEl.innerText = header
    rowEl.appendChild(tdEl)
  })
  theadEl.appendChild(rowEl)

  tableEl.appendChild(theadEl)
}

function createTableBody(tableEl, state) {
  const { posts } = state
  const tbodyEl = document.createElement('tbody')

  posts.forEach((post) => {
    const rowEl = document.createElement('tr')

    for (const key in TABLE_HEADERS) {
      const cellEl = document.createElement('td')
      cellEl.innerText = post[key] || '-'

      if (key === TABLE_HEADERS.user) {
        const user = state.cachedUsers[post.userId]

        cellEl.innerHTML = `
          <p>${user.name}</p>
          <p>${user.phone}</p>
          <p>${user.email}</p>
        `
      }

      rowEl.appendChild(cellEl)
    }

    tbodyEl.appendChild(rowEl)
  })

  tableEl.appendChild(tbodyEl)
}

function createNoPostsNotification() {
  const noPostsDiv = document.createElement('div')
  noPostsDiv.classList.add('noPosts')
  noPostsDiv.textContent = 'Oops! 😅 No posts available at the moment'

  return noPostsDiv
}

function createInfiniteScroll(handleScroll) {
  const lastPostObserver = new IntersectionObserver(
    (entries) => {
      const lastPost = entries[0]

      if (!lastPost.isIntersecting) {
        return
      }

      lastScrollPosition = window.scrollY
      handleScroll()
      lastPostObserver.unobserve(lastPost.target)
    },
    {
      rootMargin: '500px',
    }
  )

  const lastPostEl = document.querySelector(
    '.tableWrapper table tbody tr:last-child'
  )
  if (lastPostEl) {
    lastPostObserver.observe(lastPostEl)
  }
}
