let coverageElement = undefined
let coverageFileURL = undefined
let jsonData = undefined

let debounceTimer = null;

var obs = new MutationObserver(function (mutations, observer) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    renderCodeCoverage();
  }, 500); // Wait 100ms after last DOM change
});

const extractCoverageFileURL = (coverageString) => {
  const lines = coverageString.split('\n')
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('More details:')) {
      const url = trimmedLine.replace('More details:', '').trim()
      return url
    }
  }
}

const getAnnotationCoverageElement = () => {
  const items = document.getElementsByClassName('js-inline-annotations')
  if (items) {
    for (var item of items) {
      if (item.children[2].children[0].children[2].textContent.includes('code-coverage')) {
        return item.children[2].children[0].children[4]
      }
    }
  }
}

const renderCodeCoverageFromData = (data) => {
  const linesMap = getMapOfLines()

  if (linesMap) {
    data.map(({ path, coveredLines, uncoveredLines }) => {
      for (const line of coveredLines) {
        const key = `${path}:${line}`
        if (linesMap[key]) {
          linesMap[key].style.borderRight = '3px solid green';
          linesMap[key].style.paddingRight = '7px';
        }
      }
      for (const line of uncoveredLines) {
        const key = `${path}:${line}`
        if (linesMap[key]) {
          linesMap[key].style.borderRight = '3px solid red';
          linesMap[key].style.paddingRight = '7px';
        }
      }
    })
  }
}

const getMapOfLines = () => {
  const lineNumbers = document.getElementsByClassName('js-linkable-line-number')
  if (lineNumbers) {
    return Object.fromEntries([...lineNumbers].filter((item) => item.classList.contains('js-blob-rnum')).map((item) => {
      const parent = item.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
      const file = parent.getElementsByClassName('Link--primary')[0].title
      const line = item.getAttribute('data-line-number')
      return [`${file}:${line}`, item]
    }))
  }
}

const renderCodeCoverage = async () => {
  if (!coverageElement) {
    coverageElement = getAnnotationCoverageElement();
    if (!coverageElement) return
  }

  if (!coverageFileURL) {
    coverageFileURL = extractCoverageFileURL(coverageElement.textContent)
    if (!coverageFileURL) return
  }

  if (!jsonData) {
    const response = await fetch(coverageFileURL)
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(response.arrayBuffer());
    const jsonContent = await zipContent.files['coverageDiffResult.json'].async('text');
    jsonData = JSON.parse(jsonContent);

    if (jsonData) {
      renderCodeCoverageFromData(jsonData)
      obs.disconnect()

      coverageElement.children[0].children[0].children[0].innerHTML += '\nCode coverage rendered successfully';
    }
  }
}

obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
