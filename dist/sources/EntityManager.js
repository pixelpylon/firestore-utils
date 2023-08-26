const {v4: uuid} = require('uuid')
const {getLimitAndOffset} = require('back-utils')
const {Repository} = require('./Repository')
const {Transaction} = require('./Transaction')
const {difference} = require('lodash/difference')
const {intersection} = require('lodash/intersection')
const {isEmpty} = require('lodash/isEmpty')

// filters: a b c, ordering: c -> filters: c a b, ordering: c
// filters: a b c, ordering: c b -> filters: c b a, ordering c b
// filters: a b c, ordering: d -> filters: a b c, ordering a b c d
// filters: a b c, ordering: c d -> filters: c a b, ordering c a b d
const autoFixFiltersAndOrdering = (filters, ordering) => {
  if (isEmpty(filters) || isEmpty(ordering)) {
    return {filters, ordering}
  }

  const filterFields = filters.map((item) => item.field)
  const orderingFields = ordering.map((item) => item.field)

  const filterFieldsWithoutOrdering = difference(filterFields, orderingFields)
  const filterFieldsWithOrdering = intersection(orderingFields, filterFields)
  const orderingFieldsWithoutFilters = difference(orderingFields, filterFields)
  const reorderedFilterFields = [...filterFieldsWithOrdering, ...filterFieldsWithoutOrdering]
  const supplementedOrderingFields = [...reorderedFilterFields, ...orderingFieldsWithoutFilters]

  const fixedFilters = reorderedFilterFields.map((field) => {
    return filters.find((item) => item.field === field)
  })

  const fixedOrdering = supplementedOrderingFields.map((field) => {
    return ordering.find((item) => item.field === field) || {field, direction: 'asc'}
  })

  return {
    filters: fixedFilters,
    ordering: fixedOrdering,
  }
}

const applyFiltersAndOrdering = (query, filters, ordering) => {
  let mutableQuery = query

  const {
    filters: fixedFilters,
    ordering: fixedOrdering,
  } = autoFixFiltersAndOrdering(filters, ordering)

  if (!isEmpty(fixedFilters)) {
    for (const {field, filter} of fixedFilters) {
      mutableQuery = mutableQuery.where(field, '==', filter)
    }
  }

  if (!isEmpty(fixedOrdering)) {
    for (const {field, direction} of fixedOrdering) {
      mutableQuery = mutableQuery.orderBy(field, direction)
    }
  }

  return mutableQuery
}

class EntityTransactionManager {
  constructor (tx, db, collectionName) {
    this.tx = tx
    this.db = db
    this.transaction = new Transaction(tx, db, collectionName)
    this.collectionName = collectionName
  }

  ref (id) {
    return this.transaction.ref(id)
  }

  async create (entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    return this.transaction.create(resultId, data)
  }

  async update (id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    return this.transaction.update(id, data)
  }

  async one (id) {
    return this.transaction.one(id)
  }

  async item (id) {
    const item = await this.transaction.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async list (params) {
    const {filters, ordering} = params
    const {offset, limit} = getLimitAndOffset(params)
    return await this.transaction.list((collectionRef) => {
      let query = collectionRef

      if (limit) {
        query = query.limit(limit)
      }

      if (offset) {
        query = query.offset(offset)
      }

      return applyFiltersAndOrdering(query, filters, ordering)
    })
  }

  first (filters, ordering) {
    return this.transaction.first((collectionRef) => {
      return applyFiltersAndOrdering(collectionRef, filters, ordering)
    })
  }

  remove (id) {
    return this.transaction.delete(id)
  }
}

class EntityManager {
  constructor (db, collectionName) {
    this.collectionName = collectionName
    this.db = db
    this.repository = new Repository(db, collectionName)
  }

  async create (entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    const ref = await this.repository.create(resultId, data)
    return this.item(ref.id)
  }

  async update (id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    const ref = await this.repository.update(id, data)
    return this.item(ref.id)
  }

  remove (id) {
    return this.repository.delete(id)
  }

  async item (id) {
    const item = await this.repository.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async first (filters, ordering) {
    return this.repository.first((collectionRef) => {
      return applyFiltersAndOrdering(collectionRef, filters, ordering)
    })
  }

  async list (params) {
    const {filters, ordering} = params
    const {offset, limit} = getLimitAndOffset(params)
    return await this.repository.list((collectionRef) => {
      let query = collectionRef

      if (limit) {
        query = query.limit(limit)
      }

      if (offset) {
        query = query.offset(offset)
      }

      return applyFiltersAndOrdering(query, filters, ordering)
    })
  }

  tx (tx) {
    return new EntityTransactionManager(tx, this.db, this.collectionName)
  }
}

module.exports = {EntityManager}
