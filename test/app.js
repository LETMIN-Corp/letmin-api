//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Vacancy = require('../src/models/Vacancy');
let Company = require('../src/models/Company');
let User = require('../src/models/User');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

/*
  * Test the heathcheck route
*/
describe('/GET healthcheck', () => {
	it('it should GET the healthcheck', (done) => {
		chai.request(server)
			.get('/api/healthcheck')
			.end((err, res) => {
				console.log (res.body);
				res.should.have.status(200);
				res.body.should.be.a('object');
				res.body.should.have.property('success').eql(true);
				done();
			});
	});
});