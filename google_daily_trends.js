const googleTrends = require('google-trends-api');
const fs = require('node:fs');


const __get_daily_trends = (trendDate, resolve, reject) => {

	//const currentDate = new Date(Date.now());
	//console.log(trendDate.toISOString());

	googleTrends.dailyTrends({
		trendDate: trendDate, //currentDate, //new Date('2024-07-15'),
		geo: 'US',
	}, function(err, results) {
		if (err) {
			console.log(err);
			const current_date = trendDate;
                	fs.writeFileSync(`error_logs/${current_date.toISOString()}_get_daily_trends.txt`, err.toString());
			reject(err);
		} else {
			let jsonObj = JSON.parse(results);
			//fs.writeFileSync("testWhole.json", JSON.stringify(jsonObj, null, 4));
			let searches = jsonObj.default.trendingSearchesDays[0].trendingSearches;
			//fs.writeFileSync("test.json", JSON.stringify(searches, null, 4));
			let date_part = trendDate.toISOString().split('T')[0];
			date_part = date_part.replace(/-/g, '');
			if (date_part == jsonObj.default.trendingSearchesDays[0].date) resolve(searches);
			else resolve([]); // trends data does not match with the requested date
			//run({ _id: `GCP-TRENDS-${date_part}`, trendingSearches: searches, FEED_TIME: currentDate }).catch(console.dir);
		}
	});

}

const get_daily_trends = async (trendDate) => {
	const daily_trend_promise = new Promise((resolve, reject) => __get_daily_trends(trendDate, resolve, reject));
	return await daily_trend_promise;
}

exports.get_daily_trends = get_daily_trends;
