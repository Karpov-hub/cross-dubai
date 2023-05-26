# SANTRAPAY

## Install on local host

Install Redis

```
sudo apt install redis
```

Install NATS MQ

```
sudo docker run --name=nats -d -p 4222:4222 -p 8222:8222 nats-streaming
```

sudo apt-get install memcached
```

Install MINIO (for file storage)

```
docker run --name minio -p 9000:9000 minio/minio server /data
```

Clone mono repo

```
git clone git@gitlab.com:enovate/backend/santrapay-node.git
```

or

```
git clone https://gitlab.com/enovate/backend/santrapay-node.git
```

Install yarn

```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

```
npm install -g verdaccio
nohup verdaccio &

npm set registry http://localhost:4873/
npm adduser --registry http://localhost:4873
Username: test
Password: test
Email: test@test
```

Install node modules

```
yarn
npx lerna bootstrap
```

Install Imagemagick

```
sudo apt install imagemagick
```

Create directories

```
mkdir docs/json
mkdir upload
```

## Usage

Start/Stop nats

```
sudo docker start nats
sudo docker stop nats
```

Directory with microservices

```
src/
```

Start service "gate"

```
cd src/gate-service
npm start
```

Run tests

```
npm test
```

Skeleton of microservice

```
src/skeleton
```

Adding custom package

```
npx lerna create @lib/<package_name>
npx lerna add @lib/<package name> src/<service name>
```

and in the code:

```javascript
import module from "@lib/packageNmae";
```

## DB

### Adding a new model

```
npx sequelize-cli model:generate --name <model_name> --attributes id:uuid,lastName:string,email:string
```

then edit model and migration file

Run migration

```
npx sequelize-cli db:migrate
```

### Adding a seed

```
npx sequelize-cli seed:generate --name demo-user
```

This command will create a seed file in seeders folder. File name will look something like XXXXXXXXXXXXXX-demo-user.js. It follows the same up / down semantics as the migration files.

Now we should edit this file to insert demo user to User table.

```javascript
"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Users",
      [
        {
          firstName: "John",
          lastName: "Doe",
          email: "demo@demo.com",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
```

Run seeds

```
npx sequelize-cli db:seed:all
```

## Tests

### Skipping telegram tests

```
export NO_TELEGRAM=yes
```

### Running tests for specific service

```
npx lerna run test --scope=<service name>
```

## Transactions

You can add custom queries into database during a transfer transactions:

```javascript

apiMethodName(data, realm_id, userId, transactions, hooks) {
  ....
  hooks.onTransaction = async (dbTransaction, transfer) => {
    // if you want bind new records to same transfer, use transfer.id
    const res = await db.model.create({
      ...data...
    }, {
      transaction: dbTransaction
    })
  }
}

```

## Useing Workflow engine for data model in API

1. Update a data model:

```javascript
"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      .....
      signobject: DataTypes.JSONB // Add this field

    },
    {
      createdAt: "ctime",
      updatedAt: "mtime",
      deletedAt: false
    }
  );

  user.adminModelName = "Crm.modules.accountHolders.model.UsersModel"; // Model name in the admin
  return user;
};

```

2. Add workflow settings in the admin console (Main menu: Settings -> Workflow settings).

3. Use "createWF" for new records in the model:

```javascript
const user = await db.user.createWF(data);
...
```

## Docker build commands

```
docker image build . -f src/account-service/Dockerfile -t account-service:1.0.0

docker run --name=services --network host --env DB_CONN_STRING="postgres://hse:hse@localhost:5432/santradevdb" -it account-service:1.0.0

docker system prune -a // cache clear

docker start -it account /bin/sh

image size:
docker image inspect account-service:1.0.0 --format='{{.Size}}'
```
