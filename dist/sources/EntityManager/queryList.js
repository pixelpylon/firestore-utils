const {applyQueryParams} = require('./applyQueryParams')

const queryList = async (context, params) => {
  const {filters, ordering, limit} = params

  return context.list((collectionRef) => {
    return applyQueryParams(collectionRef, filters, ordering, limit ? limit : null)
  })
}

module.exports = {
  queryList,
}
