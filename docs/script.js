function hideElement(element) {
  element.style.display = 'none'
}

function showElement(element) {
  element.style.display = ''
}

function init() {
  const names = Array.from(document.querySelectorAll('[data-name]')).map(
    element => ({element, name: element.getAttribute('data-name')})
  )
  const searchBox = document.getElementById('search')
  searchBox.addEventListener('input', ev => {
    const text = ev.target.value
    for (const {element, name} of names) {
      if (name.indexOf(text) !== -1) {
        showElement(element)
      } else {
        hideElement(element)
      }
    }
  })
  searchBox.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') {
      const {name} = names.find(
        ({name}) => name.indexOf(ev.target.value) !== -1
      )
      if (name !== undefined) {
        window.location.href = '#' + name
      }
    }
  })
}

document.addEventListener('DOMContentLoaded', init)
