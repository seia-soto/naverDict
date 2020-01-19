# naverDict

Unofficial naver dictionary API wrapper.

## Table of Contents

- [Installation](#Installation)
- [Usage](#Usage)
  - [searchDictionary](#searchDictionary)
    - [Serialized data](#serialized-data)
  - [availableLanguages](#availableLanguages)

----

# Installation

- Yarn

```
yarn add naverDict
```

- NPM

```
npm i naverDict
```

# Usage

```js
const naverDict = require('naverDict')
```

## searchDictionary

- Returns `Promise`

```js
naverDict.searchDictionary('아리랑', {
  maximum: 5, // NOTE: Maximum word length is always 5.
  language: 'ko', // NOTE: See #availableLanguages (in README.md)
  raw: false // NOTE: If this set true, word objects won't serialized and include raw html values. In this library, I use `cheerio` to extract text.
})
```

### Serialized data

- If `raw` option is not set. (default)

```js
{
  ...,
  map: { // NOTE: `map` is shortcut to `searchResultMap.searchResultListMap`
    WORD: {
      items: [.../* Words are here */]
    },
    ... // NOTE: Other ranges (such as `idiom`, `meaning`, `examples`, ...)
  }
}
```

## serializeWordObject

- Returns `Object (Serialized word)`

```js
naverDict.serializeWordObject(wordObject)
```

## availableLanguages

- `Array`

```js
[
  'ko', 'en', 'zh', 'ja', 'fr', 'es', 'de', 'vi'
]
```

## requestHeaders

- `Object`

```js
{
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
```
