const {FiltersManager} = require('../FiltersManager')
const {queryList} = require('./queryList')
const {concat, uniqBy} = require('lodash')

const parallellizedQueryList = async (context, parallel, filters, ordering, limit) => {
  if (!parallel) {
    return queryList(context, {filters, ordering, limit})
  }

  const parts = await Promise.all(
    parallel.map((filter) => {
      const resultFilters = new FiltersManager(filters).prepend(filter).filters
      return queryList(context, {filters: resultFilters, ordering})
    })
  )

  return uniqBy(concat(...parts), 'id').slice(0, limit)
}

module.exports = {
  parallellizedQueryList,
}
