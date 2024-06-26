const DocumentAccessor = require('./DocumentAccessor')
const {Transaction} = require('./Transaction')

class Repository {
  constructor(db, collectionName) {
    this.db = db
    this.collectionName = collectionName
    this.collectionRef = db.collection(collectionName)
  }

  ref(id) {
    return id ? this.collectionRef.doc(id) : this.collectionRef.doc()
  }

  async set(id, data) {
    const ref = this.ref(id)
    await ref.set(data)
    return ref
  }

  async create(id, data) {
    const ref = this.ref(id)
    await ref.create(data)
    return ref
  }

  async add(data) {
    const ref = this.ref()
    await ref.set(data)
    return ref
  }

  async update(id, data) {
    const ref = this.ref(id)
    await ref.update(data)
    return ref
  }

  async delete(id) {
    const ref = this.ref(id)
    await ref.delete()
  }

  get(id) {
    return this.ref(id).get()
  }

  async one(id) {
    const result = await this.get(id)
    return DocumentAccessor.one(result)
  }

  async list(getQuery) {
    const query = await getQuery(this.collectionRef)
    const result = await query.get()
    return DocumentAccessor.list(result)
  }

  async first(getQuery) {
    const query = await getQuery(this.collectionRef)
    const limitedQuery = query.limit(1)
    const result = await limitedQuery.get()
    return DocumentAccessor.first(result)
  }

  tx(tx) {
    return new Transaction(tx, this.db, this.collectionName)
  }
}

module.exports = {Repository}
