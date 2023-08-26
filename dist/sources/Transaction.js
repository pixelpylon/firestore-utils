const DocumentAccessor = require('./DocumentAccessor')

class Transaction {
  constructor (tx, db, collectionName) {
    this.tx = tx
    this.db = db
    this.collectionRef = db.collection(collectionName)
  }

  ref (id) {
    return id ? this.collectionRef.doc(id) : this.collectionRef.doc()
  }

  async set (id, data) {
    const ref = this.ref(id)
    await this.tx.set(ref, data)
    return ref
  }

  async create (id, data) {
    const ref = this.ref(id)
    await this.tx.create(ref, data)
    return ref
  }

  async update (id, data) {
    const ref = this.ref(id)
    await this.tx.update(ref, data)
    return ref
  }

  async delete (id) {
    const ref = this.ref(id)
    await this.tx.delete(ref)
  }

  async add (data) {
    const ref = this.ref()
    await this.tx.create(ref, data)
    return ref
  }

  async one (id) {
    const result = await this.tx.get(this.ref(id))
    return DocumentAccessor.one(result)
  }

  async list (getQuery) {
    const query = getQuery(this.collectionRef)
    const result = await this.tx.get(query)
    return DocumentAccessor.list(result)
  }

  async first (getQuery) {
    const query = getQuery(this.collectionRef)
    const result = await this.tx.get(query)
    return DocumentAccessor.first(result)
  }
}

module.exports = {Transaction}
