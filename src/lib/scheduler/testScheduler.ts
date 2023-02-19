const cron = require('node-cron');

export default async function testScheduler(): Promise<void> {
	//run function xyz every minute
	cron.schedule('0 * * * * *', async () => {
		try {
			console.log('testScheduler');
		} catch (error) {
			console.error(`Error running async task: ${error}`);
		}
	});
}
