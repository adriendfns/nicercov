function removeCodeCoverageAnnoations() {
  const items = document.getElementsByClassName('js-inline-annotations')

  if (items) {
    for (var item of items) {
      try {
        if (item.children[2].children[0].children[4].textContent.includes('not covered by a test')) {
          const url = item.children[2].children[0].children[3].textContent.split('#')
          const lines = url[1].split('-')
          const lineCount = lines.length === 1 ? 1 : 1 + parseInt(lines[1].replace(/[^0-9]/g, '')) - parseInt(lines[0].replace(/[^0-9]/g, ''))

          let currentItem = item

          for (var i = 0; i < lineCount; i++) {
            currentItem = currentItem.previousElementSibling
            currentItem.children[2].style.borderRight = '3px solid red'
            currentItem.children[2].style.paddingRight = '7px'
          }

          item.style.display = 'none'
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}

var obs = new MutationObserver(function (mutations, observer) {
  removeCodeCoverageAnnoations();
});

obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
