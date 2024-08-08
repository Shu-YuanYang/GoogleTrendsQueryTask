const CONFIG = require('./config.json');
const { client_run, insert_doc } = require('./mongo_client');
const { get_daily_trends } = require('./google_daily_trends');
const cron = require('node-cron');
const fs = require('node:fs');
const PipelinedLogger = require("node-log-service/pipelined_logging");


// Function to insert Google Daily Trends data into Mongo DB:
const documentGoogleTrends = async (doc_counter, id_part, GCP_daily_trends, feed_time, DBClient, base_log_metadata, pipelinedLogger) => {

	try {
		let doc_part = (doc_counter + "").padStart(3, "0");
		let doc = {
			"_id": `GCP-TRENDS-${id_part}-${doc_part}`,
			"trendingSearches": GCP_daily_trends,
			"FEED_TIME": feed_time
		}
		if (0 < GCP_daily_trends.length) await insert_doc(DBClient, "GCPDocDB", "CL_GOOGLE_DAILY_TREND", doc);

		let log = {
			metadata: { ...base_log_metadata, severity: "INFO" },
			content: `Fetched Google Daily Trends at ${doc.FEED_TIME} and saved into MongoDB GCPDocDB.CL_GOOGLE_DAILY_TREND. Document _id: ${doc._id}`,
			note: "Successfully fetched Google Daily Trends."
		};
		await pipelinedLogger.writeLogEntry(log);

	} catch (trends_err) {
		var log = {
			metadata: { ...base_log_metadata, severity: "ERROR" },
			content: trends_err.toString(),
			note: "Google Daily Trends fetching failed!"
		};
		await pipelinedLogger.writeLogEntry(log);

	}

};



// Function to download Googld Daily Trends (including MongoDB document insertion):
const downloadGoogleTrends = async (credentials, base_log_metadata, pipelinedLogger) => {

	try {
		await client_run(credentials.MONGODB, async (DBClient) => {
                	let doc_counter = 2;

			// 1. Get trends from current day:
			let currentTimestamp = Date.now();
			let currentDate = new Date(currentTimestamp);
			let GCP_daily_trends = await get_daily_trends(currentDate);
                        const id_part = (currentTimestamp + "").padStart(30, "0");
			await documentGoogleTrends(doc_counter, id_part, GCP_daily_trends, currentDate, DBClient, base_log_metadata, pipelinedLogger);
			--doc_counter;

			// 2. Get trends from the previous day:
                        let previousDate = new Date(currentTimestamp);
                        previousDate.setDate(previousDate.getDate() - 1);
                        let previousTimestamp = previousDate.valueOf();
                        GCP_daily_trends = await get_daily_trends(previousDate);
			await documentGoogleTrends(doc_counter, id_part, GCP_daily_trends, previousDate, DBClient, base_log_metadata, pipelinedLogger);
			--doc_counter;
		});

	} catch (mongo_err) {
		var log = {
			metadata: { ...base_log_metadata, severity: "ERROR" },
			content: mongo_err.toString(),
			note: "Mongo DB client transaction failed!"
		};
		await pipelinedLogger.writeLogEntry(log);

	}

};




// Function to define scheduled job logic:
const runScheduledJob = async () => {

	// Config credentials locations:
	const credentials = {
		GCP: "credentials/gcp_service_account_secrets.json",
		SQLDB: "credentials/mssql_connection_config.json",
		MONGODB: "credentials/mongodb_connection_config.json"
	};

	// Initialise logger:
	var pipelinedLogger = new PipelinedLogger(CONFIG, credentials);
	const base_log_metadata = {
		labels: { log_type: CONFIG.gcpLogConfig.log_type },
		resource: {
			labels: { ...CONFIG.gcpLogConfig, project_id: CONFIG.projectId.GCP },
			type: "gce_instance"
		}
		// See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logsev>
		// severity: "INFO",
	};

	await downloadGoogleTrends(credentials, base_log_metadata, pipelinedLogger);

}



// Run jobs:
//cron.schedule("00 12 * * *", () => {
	runScheduledJob().catch(err => {
		fs.writeFileSync(`error_logs/${current_date.toISOString()}_main_job.txt`, err.toString());
	});
//});
