let nats, memcached, pgsql;

pgsql = {
  use_env_variable: "DB_CONN_STRING",
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  debugQuery: false,
  debug: false
};

if (process.env.NODE_ENV == "staging") {
  memcached = {
    servers: "memcached:11211",
    options: {}
  };
  nats = {
    servers: ["nats://nats:4222"],
    json: true
  };

  pgsql.schema = "staging";
} else if (process.env.NODE_ENV == "production") {
  nats = {
    servers: ["nats://172.31.4.172:5221"],
    json: true
  };
  memcached = {
    servers: "172.31.4.172:11211",
    options: {}
  };
} else if (process.env.NODE_ENV == "cross") {
  nats = {
    servers: ["nats://172.31.5.91:5221"],
    json: true
  };
  pgsql.schema = "crossdubai";
  memcached = {
    servers: "172.31.5.91:11211",
    options: {}
  };
} else {
  pgsql = {
    user: "hse",
    database: "falconb2bdb",
    password: "hse",
    schema: "crossdubai",
    host: "localhost",
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    debugQuery: false,
    debug: false
  };
}

exports.memcached = memcached;
exports.nats = nats;
exports.pgsql = pgsql;
