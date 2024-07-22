const { MongoClient } = require("mongodb");
const fs = require("node:fs");



const client_run = async (connection_str, job) => {
	const client = new MongoClient(connection_str);
	await client.connect();

	await job(client);

	await client.close();
}


const insert_doc = async (client, database_name, collection_name, doc) => {
	const database = client.db(database_name);
	const collection = database.collection(collection_name);
	
	try {
		const insert_result = await collection.insertOne(doc);
		console.log(insert_result);
	} catch (err) {
		console.error(err);
		const current_date = new Date(Date.now());
		fs.writeFileSync(`error_logs/${current_date.toISOString()}_insert_doc.txt`, err.toString());
	}

}


exports.client_run = client_run;
exports.insert_doc = insert_doc;
