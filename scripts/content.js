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

const getAnnotationCoverageString = () => {
  const items = document.getElementsByClassName('js-inline-annotations')
  if (items) {
    for (var item of items) {
      if (item.children[2].children[0].children[2].textContent.includes('code-coverage')) {
        return item.children[2].children[0].children[4].textContent
      }
    }
  }
}

const renderCodeCoverageFromData = (data) => {
  const datamap = Object.fromEntries(data.map(({ path, coveredLines, uncoveredLines }) => [path, { coveredLines, uncoveredLines }]))
  const items = document.getElementsByClassName('js-file')
  if (items) {
    for (var item of items) {
      const truc = item.children[0].children[0].children
      if (datamap[truc[truc.length - 1].children[0].title]) {


        const { coveredLines, uncoveredLines } = datamap[truc[truc.length - 1].children[0].title]

        const lines = item.children[1].children[0].children[2].children[2].children

        for (var line of lines) {
          if (line && line.children && line.children.length > 2) {
            const lineNumber = parseInt(line.children[2].getAttribute('data-line-number'))
            if (coveredLines.includes(lineNumber)) {
              line.children[2].style.borderRight = '3px solid green';
              line.children[2].style.paddingRight = '7px';
            } else if (uncoveredLines.includes(lineNumber)) {
              line.children[2].style.borderRight = '3px solid red';
              line.children[2].style.paddingRight = '7px';
            }
          }
        }
      }
    }
  }
}

const renderCodeCoverage = () => {
  const coverageString = getAnnotationCoverageString();
  const coverageFileURL = extractCoverageFileURL(coverageString)

  fetch(coverageFileURL)
    .then(async response => {
      try {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(response.arrayBuffer());
        const jsonContent = await zipContent.files['coverageDiffResult.json'].async('text');
        const jsonData = JSON.parse(jsonContent);
        renderCodeCoverageFromData(jsonData)
      } catch (error) { }
    })
    .catch(error => { })
}

var obs = new MutationObserver(function (mutations, observer) {
  renderCodeCoverage();
});

obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });
