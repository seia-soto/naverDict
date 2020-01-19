const debug = require('debug')
const cheerio = require('cheerio')
const request = require('request')

const naverDict = {}

const log = debug('naverDict')

naverDict.serializeWordObject = word => {
  // NOTE: Normalize `expEntry`
  word.expEntry = cheerio('strong', word.expEntry).text()

  // NOTE: Normalize `meansCollector(iter)`
  for (let i = 0; i < word.meansCollector; i++) {
    const meansObj = word.meansCollector[i]
    const elements = cheerio(meansObj.value).toArray()

    meansObj.value = []

    for (let k = 0; k < elements.length; k++) {
      meansObj.value.push(cheerio(elements[k]).text())
    }

    meansObj.value.join(' ')
  }

  // NOTE: Normalize `searchPhoneticSymbolList(iter)`
  for (let j = 0; j < word.searchPhoneticSymbolList.length; j++) {
    const symbolObj = word.searchPhoneticSymbolList[j]

    symbolObj.phoneticSymbol = cheerio('strong', symbolObj.phoneticSymbol).text()
  }

  return word
}
naverDict.requestHeaders = {
  Accept: '*/*',
  DNT: 1,
  Host: 'ko.dict.naver.com',
  Cookie: 'nid_slevel=1; nid_enctp=1; nx_ssl=2',
  'Accept-Language': 'en,ko-KR;q=0.9,ko;q=0.8,en-US;q=0.7',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
  'Sec-Fetch-Mode': 'no-cors',
  'Sec-Fetch-Site': 'same-site',
  'Cache-Control': 'no-cache',
  'upgrade-insecure-requests': 1
}
naverDict.availableLanguages = [
  'ko', 'en', 'zh', 'ja', 'fr', 'es', 'de', 'vi'
]
naverDict.searchDictionary = (word, opts) => {
  return new Promise((resolve, reject) => {
    opts = opts || {}
    opts.language = (opts.language || 'ko').toLowerCase()
    opts.maximum = opts.maximum || 5
    /*
      :: UNSUPPORTED FEATURE
      opts.page = opts.page || 1
    */
    // opts.raw: return raw object (unneccesary opt)

    if (!word) {
      reject('Word to query is required.')
    }
    if (!naverDict.availableLanguages.includes(opts.language)) {
      reject(`'language' option should be one of '${naverDict.availableLanguages.join(', ')}'.`)
    }
    if (!/^(0|([1-9]\d*))$/.test(opts.maximum)) {
      reject(`'maximum' option should be a natural number.`)
    }

    log(`Requesting to API.\n  - word: ${word}\n  - range: ${opts.range}`)

    request({
      url: `https://dict.naver.com/api3/${opts.language}ko/search?query=${encodeURIComponent(word)}&m=pc`,
      headers: naverDict.requestHeaders,
      gzip: true
    }, async (error, response, body) => {
      if (error) {
        reject(error)
      }

      log(`Got response from server.\n  - response code: ${(response || {}).statusCode || null}`)

      try {
        const data = await JSON.parse(body)
        const words = data.searchResultMap.searchResultListMap.WORD.items

        if (!opts.raw) {
          for (let i = 0; i < words.length; i++) {
            words[i] = naverDict.serializeWordObject(words[i])
          }
        }
        /*
          :: UNSUPPORTED FEATURE
        if (opts.maximum > words.length) {
          while (
            words.length === data.searchResultMap.searchResultListMap.WORD.total ||
            opts.maximum === data.searchResultMap.searchResultListMap.WORD.total
          ) {
            const additionalData = await naverDict.searchDictionary(word, { maximum: opts.maximum - words.length })
            const additionalWords = additionalData.searchResultMap.searchResultListMap.WORD.items

            for (let k = 0; k < additionalWords.length; k++) {
              await words.push(additionalWords[k])
            }
          }
        }
        */

        data.searchResultMap.searchResultListMap.WORD.items = await data.searchResultMap.searchResultListMap.WORD.items.slice(0, opts.maximum)
        data.map = data.searchResultMap.searchResultListMap

        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = naverDict
