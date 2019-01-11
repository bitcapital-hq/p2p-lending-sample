import Bitcapital, { User, Session, StorageUtil, MemoryStorage } from 'bitcapital-core-sdk';

const credentials = {
  baseURL: process.env.BITCAPITAL_CLIENT_URL,
  clientId: process.env.BITCAPITAL_CLIENT_ID,
  clientSecret: process.env.BITCAPITAL_CLIENT_SECRET
};

const session: Session = new Session({
  storage: new StorageUtil('session', new MemoryStorage()),
  http: credentials,
  oauth: credentials
})

class BitcapitalService {
  public static bitcapital: Bitcapital;

  public static async initialize() {
    BitcapitalService.bitcapital = Bitcapital.initialize({
      session,
      ...credentials
    });
    await BitcapitalService.bitcapital.session().clientCredentials();

    return BitcapitalService.bitcapital;
  }

  public static async getAPIClient() {
    if (BitcapitalService.bitcapital) {
      return BitcapitalService.bitcapital;
    }

    return BitcapitalService.initialize()
  }
};

export default BitcapitalService;

// let bitcapital: Bitcapital;

// async function initialize() {
//   bitcapital = Bitcapital.initialize({
//     session,
//     ...credentials
//   });

//   await bitcapital.session().clientCredentials();
//   return bitcapital;
// }

// export async function getAPIClient() {
//   return (bitcapital ? bitcapital : await initialize());
// }

// export async function authenticateUser(person: User): Promise<User> {
//     const client = await getBitcapitalAPIClient();
//     const remoteUser = await client.session().password({
//         username: person.email,
//         password: "123123"
//     });

//     return remoteUser;
// }