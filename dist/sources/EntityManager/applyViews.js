const {orderBy} = require('lodash')
const {applyViewFilter} = require('./applyViewFilter')

const applyView = (list, {filters, ordering, limit}) => {
  let result = list

  for (const filter of filters) {
    result = applyViewFilter(result, filter)
  }

  result = orderBy(result, ordering)

  return result.slice(0, limit)
}

const applyViews = (list, views) => {
  let result = list

  for (const view of views || []) {
    result = applyView(result, view)
  }

  return result
}

module.exports = {
  applyViews,
}
