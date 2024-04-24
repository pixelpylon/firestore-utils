const {resolveOperator} = require('./resolveOperator')

const applyQueryParams = (query, filters = [], ordering = [], limit) => {
  let mutableQuery = query

  const normalizedOrdering = ordering.map((item) => {
    if (typeof item === 'string') {
      return {
        field: item,
        direction: 'asc',
      }
    }

    return {
      field: item.field,
      direction: item.direction || 'asc',
    }
  })

  const significantFilters = filters.filter(Boolean)

  for (const filter of significantFilters) {
    const {field, value} = filter
    const op = resolveOperator(filter.op, value)
    mutableQuery = mutableQuery.where(field, op, value)
  }

  for (const {field, direction} of normalizedOrdering) {
    mutableQuery = mutableQuery.orderBy(field, direction)
  }

  if (limit) {
    mutableQuery = mutableQuery.limit(limit)
  }

  return mutableQuery
}

module.exports = {
  applyQueryParams,
}
