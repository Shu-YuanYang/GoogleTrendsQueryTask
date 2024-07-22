const CONFIG = require('./config.json');
const { client_run, insert_doc } = require('./mongo_client');
const { get_daily_trends } = require('./google_daily_trends');
const cron = require('node-cron');



// Run jobs:
cron.schedule("00 12 * * *", () => {

	client_run(CONFIG.connection_strings.mongodb_main, async (DBClient) => {
		let doc_counter = 2;

		// 1. Get trends from current day:
		let currentTimestamp = Date.now();
		let currentDate = new Date(currentTimestamp);
		let GCP_daily_trends = await get_daily_trends(currentDate);
		//console.log(currentDate);
		//console.log(GCP_daily_trends);
		//console.log("");		

		const id_part = (currentTimestamp + "").padStart(30, "0");
		let doc_part = (doc_counter + "").padStart(3, "0");
		let doc = {
			"_id": `GCP-TRENDS-${id_part}-${doc_part}`,
			"trendingSearches": GCP_daily_trends,
			"FEED_TIME": currentDate
		}
		if (0 < GCP_daily_trends.length) await insert_doc(DBClient, "GCPDocDB", "CL_GOOGLE_DAILY_TREND", doc);
		--doc_counter;

		// 2. Get trends from the previous day:
		let previousDate = new Date(Date.now());
		previousDate.setDate(previousDate.getDate() - 1);
		let previousTimestamp = previousDate.valueOf();
                GCP_daily_trends = await get_daily_trends(previousDate);
		//console.log(previousDate);
		//console.log(GCP_daily_trends);
		//console.log("");

                //const id_part = (previousTimestamp + "").padStart(30, "0");
		doc_part = (doc_counter + "").padStart(3, "0");
                doc = {
                        "_id": `GCP-TRENDS-${id_part}-${doc_part}`,
                        "trendingSearches": GCP_daily_trends,
                        "FEED_TIME": previousDate
                }
                if (0 < GCP_daily_trends.length) await insert_doc(DBClient, "GCPDocDB", "CL_GOOGLE_DAILY_TREND", doc);
		--doc_counter;

	}).catch(console.dir);

});


