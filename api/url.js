import axios from 'axios'


const cheerio = require('cheerio')


function shortenUrl(longUrl, cb) {
  const url = `https://tinyurl.com/create.php?source=create&url=${longUrl}&alias=`
  axios.get(url)
    .then((res) => {
      const $ = cheerio.load(res.data)
      const shortUrl = $('#contentcontainer > div:nth-child(5) > b').text()
      cb(null, shortUrl)
    })
    .catch(e => cb(e))
}

export default (req, res) => {
  const {url} = req.query
  console.log('url', url)
  if (!url) {
    res.status(400).json({
      status: 400,
      error: `Missing required parameter 'url'`,
      meta: {
        slug: 'Required parameter',
      },
    })
    return
  }
  shortenUrl(url, (err, shortUrl) => {
    let result
    if (err || !shortUrl) {
      console.error('error', err)
      return res.status(400).json({
        status: 400,
        error: err || 'Code not found by url',
      })
    } else {
      result = {
        status: 200,
        data: shortUrl,
      }
    }
    res.status(200).json(result)
  })
}
