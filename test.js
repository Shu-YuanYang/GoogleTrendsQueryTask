//const fs = require('node:fs');
const {Logging} = require('@google-cloud/logging');


//const current_date = new Date(Date.now());
//fs.writeFileSync(`error_logs/${current_date.toISOString()}_test.txt`, "some message");
//.replace(/:/g, '').replace(/./g, '')


// Creates a client
const logging = new Logging({ 
	projectId: "cloudsharpsystems", 
	keyFilename: "gcp_service_account_secrets.json"
});

// Selects the log to write to
const log = logging.log("TestLog");

// The data to write to the log
const text = 'Hello, world!';

// The metadata associated with the entry
const metadata = {
	resource: {type: 'global'},
	// See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
	severity: 'INFO',
};

// Prepares a log entry
const entry = log.entry(metadata, text);

async function writeLog() {
	// Writes the log entry
	await log.write(entry);
	console.log(`Logged: ${text}`);
}
writeLog();
