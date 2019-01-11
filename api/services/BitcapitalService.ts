import Bitcapital, { User, Session, StorageUtil, MemoryStorage } from 'bitcapital-core-sdk';

const credentials = {
    baseURL: process.env.BITCAPITAL_BASE_URL,
    clientId: process.env.BITCAPITAL_CLIENT_ID,
    clientSecret: process.env.BITCAPITAL_CLIENT_SECRET
}

const session = new Session({
    storage: new StorageUtil("session", new MemoryStorage()),
    http: credentials,
    oauth: credentials
});

let bitcapitalClient: Bitcapital;

async function initialize() {
    bitcapitalClient = Bitcapital.initialize({ session, ...credentials });
    await bitcapitalClient.session().clientCredentials();
}

export async function getBitcapitalAPIClient() {
    if(!bitcapitalClient) {
        await initialize();
    }

    return bitcapitalClient;
}