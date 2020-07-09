import { MongoClient, Db, Collection } from 'mongodb';
import config from 'config/mongo';

const { dbName, url } = config;

let db: Db;
const client = new MongoClient(url, { useUnifiedTopology: true }).connect();

export async function connectToMongo(): Promise<void> {
    db = (await client).db(dbName);
}

export function getDb(): Db {
    return db;
}

export function getCollection<T>(name: string): Collection<T> {
    return db.collection<T>(name);
}

export async function close(): Promise<void> {
    return (await client).close();
}
