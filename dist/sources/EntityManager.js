const {v4: uuid} = require('uuid')
const {Repository} = require('./Repository')
const {Transaction} = require('./Transaction')

const applyFiltersAndOrdering = (query, filters = [], ordering = []) => {
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

  for (const {field, value: valueOrValueObject} of filters) {
    if (
      typeof valueOrValueObject === 'string' ||
      typeof valueOrValueObject === 'number' ||
      typeof valueOrValueObject === 'boolean'
    ) {
      mutableQuery = mutableQuery.where(field, '==', valueOrValueObject)
    } else if (Array.isArray(valueOrValueObject)) {
      mutableQuery = mutableQuery.where(field, 'in', valueOrValueObject)
    } else if (typeof valueOrValueObject === 'object') {
      const {value, op} = valueOrValueObject
      mutableQuery = mutableQuery.where(field, op, value)
    } else {
      throw new Error(`Unexpected type of value '${JSON.stringify(valueOrValueObject)}'`)
    }
  }

  for (const {field, direction} of normalizedOrdering) {
    mutableQuery = mutableQuery.orderBy(field, direction)
  }

  return mutableQuery
}

const queryList = async (context, params) => {
  const {filters, ordering, cursor, limit} = params

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
  constructor(tx, db, collectionName) {
    this.tx = tx
    this.db = db
    this.transaction = new Transaction(tx, db, collectionName)
    this.collectionName = collectionName
  }

  ref(id) {
    return this.transaction.ref(id)
  }

  async create(entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    return this.transaction.create(resultId, data)
  }

  async update(id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    return this.transaction.update(id, data)
  }

  async one(id) {
    return this.transaction.one(id)
  }

  async item(id) {
    const item = await this.transaction.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async list({filters, ordering, limit}) {
    const {list} = await queryList(this.transaction, {filters, ordering, limit})
    return list
  }

  async paginatedList({filters, ordering, cursor, limit}) {
    return queryList(this.transaction, {filters, ordering, cursor, limit})
  }

  first({filters, ordering}) {
    return this.transaction.first((collectionRef) => {
      return applyFiltersAndOrdering(collectionRef, filters, ordering)
    })
  }

  remove(id) {
    return this.transaction.delete(id)
  }
}

class EntityManager {
  constructor(db, collectionName) {
    this.collectionName = collectionName
    this.db = db
    this.repository = new Repository(db, collectionName)
  }

  async create(entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    const ref = await this.repository.create(resultId, data)
    return this.item(ref.id)
  }

  async update(id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    const ref = await this.repository.update(id, data)
    return this.item(ref.id)
  }

  remove(id) {
    return this.repository.delete(id)
  }

  async item(id) {
    const item = await this.repository.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async one(id) {
    return this.repository.one(id)
  }

  async first({filters, ordering}) {
    return this.repository.first((collectionRef) => {
      return applyFiltersAndOrdering(collectionRef, filters, ordering)
    })
  }

  async list({filters, ordering, limit}) {
    const {list} = await queryList(this.repository, {filters, ordering, limit})
    return list
  }

  async paginatedList({filters, ordering, cursor, limit}) {
    return queryList(this.repository, {filters, ordering, cursor, limit})
  }

  tx(tx) {
    return new EntityTransactionManager(tx, this.db, this.collectionName)
  }
}

module.exports = {
  EntityManager,
  EntityTransactionManager,
}
