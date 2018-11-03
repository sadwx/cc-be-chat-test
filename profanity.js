const config = require('./config')

// sort the profanity words by it's length, longer words comes first
const profanityList = config.PROFANITY_LIST.splice().sort((a, b) => {
  return a.length !== b.length ? b.length - a.length : a.localeCompare(b)
})

const check = (msg) => {
  // replace longer profanity first, this can avoid incomplete check
  for (let i = 0; i < profanityList.length; ++i) {
    let word = profanityList[i]
    let replacement = '*'.repeat(word.length)
    msg = msg.split(word).join(replacement)

    // if all msg has been replace to all *, just finish the remaining check
    if (msg.split('*').join('') === '') {
      break
    }
  }
  return msg
}

exports.check = check
