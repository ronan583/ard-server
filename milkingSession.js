const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class MilkingSessionManager {
	constructor() {
		this.isMilkingActive = false;
		this.milkingName = '';
		this.csvWriter = null;
		this.initWriter();
	}
	initWriter(){
		this.csvWriter = createCsvWriter({path:'test.csv', header:['name', 'lang']});
		this.csvWriter.writeRecords([{name:'bab', lang:'fen'},{name:'bab', lang:'fen'}]).then(()=>{console.log('test created');})
	}
	handleNewConnection(){
		console.log('Connected!');
	}
}
module.exports = MilkingSessionManager;