# p2p-lending-sample

P2P Lending operation sample using Bitcapital APIs

## Usage

Clone or download

```bash
$ git clone git@github.com:bitcapital-hq/p2p-lending-sample.git
```

Enter folder and install dependencies:

```bash
$ cd p2p-lending-sample
p2p-lending-sample $ yarn install
```

Set the environment saving the .env.sample file to .env. The variables are the following:

```env
DATABASE_HOST= # the address to the PostgreSQL DB server
DATABASE_PORT= # the port to the PostgreSQL DB server
DATABASE_USER= # the user to the DB server
DATABASE_PASSWORD= #the password to the DB server
DATABASE_NAME= # the database name
LOCAL_ASSET_CODE= # the code for the asset you will create or other that you cam emit
LOCAL_ASSET_ID= # the Bitcapital id for the asset you will create or other that you cam emit
BITCAPITAL_CLIENT_URL= # The URL to the Bitcapital service
BITCAPITAL_CLIENT_ID= # Your client ID (Provided by Bitcapital)
BITCAPITAL_CLIENT_SECRET= # Your client secret (Provided by Bitcapital)
BITCAPITAL_CLIENT_DOMAIN= # Your client domain (Provided by Bitcapital)
BITCAPITAL_MEDIATOR_EMAIL= # Your mediator credential email (Provided by Bitcapital)
BITCAPITAL_MEDIATOR_PASSWORD= # Your mediator credential password (Provided by Bitcapital)
PAGINATION_LIMIT= # The max itens per page
REMOTE_AUTH_SECRET= # Post back secret
REMOTE_AUTH_PASS= # Post back password
```