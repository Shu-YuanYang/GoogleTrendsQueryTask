const { get_new_hash_id } = require("node-log-service/hash_id");

const ID = get_new_hash_id("TestProgram");
console.log(ID);
