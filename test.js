//const fs = require('node:fs');
const os = require('os');
const {Logging} = require('@google-cloud/logging');
const CONFIG = require('./config.json');


//const current_date = new Date(Date.now());
//fs.writeFileSync(`error_logs/${current_date.toISOString()}_test.txt`, "some message");
//.replace(/:/g, '').replace(/./g, '')


// Creates a client
const logging = new Logging({
	projectId: CONFIG.projectId,
	keyFilename: "gcp_service_account_secrets.json"
});

// Selects the log to write to
const log = logging.log(CONFIG.taskName);

// The data to write to the log
const text = "Identify task with labels";

// The metadata associated with the entry
const metadata = {
	labels: { instance_name: os.hostname(), log_type: CONFIG.gcpConfig.log_type },
	resource: {
		labels: { ...CONFIG.gcpConfig, project_id: CONFIG.projectId },
		type: "gce_instance"
	},
	// See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
	severity: "INFO",
};

// Prepares a log entry
const entry = log.entry(metadata, text);

async function writeLog() {
	// Writes the log entry
	await log.write(entry);
	console.log(`Logged: ${text}`);
}
writeLog();
