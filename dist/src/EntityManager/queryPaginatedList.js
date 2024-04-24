const {applyQueryParams} = require('./applyQueryParams')

const queryPaginatedList = async (context, params) => {
  const {filters, ordering, cursor, limit} = params

  const list = await context.list(async (collectionRef) => {
    let query = applyQueryParams(collectionRef, filters, ordering, limit ? limit + 1 : null)

    if (cursor) {
      const cursorSnapshot = await context.get(cursor)
      query = query.startAt(cursorSnapshot)
    }

    return query
  })

  if (!limit) {
    return {list}
  }

  if (list.length < limit + 1) {
    return {
      list: list.slice(0, limit),
    }
  }

  return {
    list: list.slice(0, limit),
    nextCursor: list[list.length - 1].id,
  }
}

module.exports = {
  queryPaginatedList,
}
