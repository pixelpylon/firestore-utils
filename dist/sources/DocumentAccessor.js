const one = (result) => {
  return result.exists ? result.data() : null
}

const list = (result) => {
  return result.empty ? [] : result.docs.map((doc) => doc.data())
}

const first = (result) => {
  return result.empty ? null : result.docs[0].data()
}

module.exports = {
  one,
  list,
  first,
}
