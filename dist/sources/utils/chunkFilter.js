const {isArray, chunk} = require('lodash')

const chunkFilter = (filter) => {
  if (!isArray(filter.value)) {
    throw new Error(`Unexpected value '${JSON.stringify(filter.value)}'`)
  }

  const op = filter.op || 'in'

  if (!['in', 'not-in', 'array-contains-any'].includes(filter.op)) {
    throw new Error(`Unexpected operation '${filter.op}'`)
  }

  if (op === 'array-contains-any') {
    return chunk(filter.value, 10).map((value) => {
      return {
        ...filter,
        value,
      }
    })
  }

  return chunk(filter.value, 30).map((value) => {
    return {
      ...filter,
      value,
    }
  })
}

module.exports = {
  chunkFilter,
}
