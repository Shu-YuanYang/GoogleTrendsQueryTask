const fs = require('node:fs');


const current_date = new Date(Date.now());
fs.writeFileSync(`error_logs/${current_date.toISOString()}_test.txt`, "some message");
//.replace(/:/g, '').replace(/./g, '')
