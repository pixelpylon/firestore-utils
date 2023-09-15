const {v4: uuid} = require('uuid')
const {Repository} = require('./Repository')
const {Transaction} = require('./Transaction')
const difference = require('lodash/difference')
const intersection = require('lodash/intersection')

// filters: a b c, ordering: c -> filters: c a b, ordering: c
// filters: a b c, ordering: c b -> filters: c b a, ordering c b
// filters: a b c, ordering: d -> filters: a b c, ordering a b c d
// filters: a b c, ordering: c d -> filters: c a b, ordering c a b d
const autoFixFiltersAndOrdering = (filters = [], ordering = []) => {
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

  const filterFields = filters.map((item) => item.field)
  const orderingFields = normalizedOrdering.map((item) => item.field)

  const filterFieldsWithoutOrdering = difference(filterFields, orderingFields)
  const filterFieldsWithOrdering = intersection(orderingFields, filterFields)
  const orderingFieldsWithoutFilters = difference(orderingFields, filterFields)
  const reorderedFilterFields = [...filterFieldsWithOrdering, ...filterFieldsWithoutOrdering]
  const supplementedOrderingFields = [...reorderedFilterFields, ...orderingFieldsWithoutFilters]

  const fixedFilters = reorderedFilterFields.map((field) => {
    return filters.find((item) => item.field === field)
  })

  const fixedOrdering = supplementedOrderingFields.map((field) => {
    return normalizedOrdering.find((item) => item.field === field) || {field, direction: 'asc'}
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

  for (const {field, value: valueOrValueObject} of fixedFilters) {
    if (typeof valueOrValueObject === 'string' ||
        typeof valueOrValueObject === 'number' ||
        typeof valueOrValueObject === 'boolean') {
      mutableQuery = mutableQuery.where(field, '==', valueOrValueObject)
    } else if (typeof valueOrValueObject === 'object') {
      const {value, op} = valueOrValueObject
      mutableQuery = mutableQuery.where(field, op, value)
    } else {
      throw new Error(`Unexpected type of value '${JSON.stringify(valueOrValueObject)}'`)
    }
  }

  for (const {field, direction} of fixedOrdering) {
    mutableQuery = mutableQuery.orderBy(field, direction)
  }

  return mutableQuery
}

const queryList = async (context, params) => {
  const {filters, ordering, cursor, limit} = params
  console.log(params)

  const list = await context.list(async (collectionRef) => {
    let query = applyFiltersAndOrdering(collectionRef, filters, ordering)

    if (limit) {
      query = query.limit(limit + 1)
    }

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
      list: list.slice(0, -1),
    }
  }

  return {
    list: list.slice(0, -1),
    nextCursor: list[list.length - 1].id,
  }
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
    return queryList(this.transaction, params)
  }

  first ({filters, ordering}) {
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

  async first ({filters, ordering}) {
    return this.repository.first((collectionRef) => {
      return applyFiltersAndOrdering(collectionRef, filters, ordering)
    })
  }

  async list (params) {
    return queryList(this.repository, params)
  }

  tx (tx) {
    return new EntityTransactionManager(tx, this.db, this.collectionName)
  }
}

module.exports = {
  EntityManager,
  EntityTransactionManager,
}
