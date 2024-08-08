


const test_reject = async () => {
        const promise = new Promise((resolve, reject) => reject(new Error("Doomed to reject!")));
        return await promise;
}

test_reject()
	.then(resolved_data => console.log(resolved_data))
	.catch(rejected_data => console.log(rejected_data.toString()));
