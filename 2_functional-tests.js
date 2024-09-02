const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { request } = require('https');

chai.use(chaiHttp);

let issue1;
let issue2;

suite('Functional Tests', function () {
  suite('Routing tests', function () {
    suite('POST request tests', function () {
      test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Issue one',
            issue_text: 'Functional Test - Every field filled in',
            created_by: 'Kate',
            assigned_to: 'Liz',
            status_text: 'In QA',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            issue1 = res.body;
            assert.equal(res.body.issue_title, 'Issue one');
            assert.equal(
              res.body.issue_text,
              'Functional Test - Every field filled in'
            );
            assert.equal(res.body.created_by, 'Kate');
            assert.equal(res.body.assigned_to, 'Liz');
            assert.equal(res.body.status_text, 'In QA');
            done();
          });
      }).timeout(10000);

      test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .set('content-type', 'application/json')
          .send({
            issue_title: 'Issue two',
            issue_text: 'Functional Test - Required fields',
            created_by: 'dave',
            assigned_to: '',
            status_text: '',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            issue2 = res.body;
            assert.equal(issue2.issue_title, 'Issue two');
            assert.equal(
              issue2.issue_text,
              'Functional Test - Required fields'
            );
            assert.equal(issue2.created_by, 'dave');
            assert.equal(issue2.assigned_to, '');
            assert.equal(issue2.status_text, '');
            done();
          });
      }).timeout(5000);

      test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
        chai
          .request(server)
          .post('/api/issues/test')
          .set('content-type', 'application/json')
          .send({
            issue_title: '',
            issue_text: '',
            created_by: 'Dave',
            assigned_to: '',
            status_text: '',
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
    });
    suite('GET request tests', function () {
        test('View issues on a project: GET request to /api/issues/{project}', function (done) {
            chai
              .request(server)
              .get('/api/issues/test')
              .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
              });
          });
          test('View issues on a project with one filter', function (done) {
            chai
              .request(server)
              .get('/api/issues/test')
              .query({_id: issue1._id})
              .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body[0].issue_title, issue1.issue_title)
                assert.equal(res.body[0].issue_text, issue1.issue_text)
                done();
              });
          })
          test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
            chai
            .request(server)
            .get('/api/issues/test')
            .query({issue_text: issue1.issue_text, issue_title: issue1.issue_title})
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body[0].issue_title, issue1.issue_title)
                assert.equal(res.body[0].issue_text, issue1.issue_text)
                done();
            })
          })
    })
    suite('Using PUT function', function () {
        test('Update one field on an issue', function (done) {

            chai
            .request(server)
            .put('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: issue1._id,
                issue_title: 'Dave'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.result, 'successfully updated')
                assert.equal(res.body._id, issue1._id)
                done();
            })
        })
        test('Update multiple fields on an issue:', function (done) {

            chai
            .request(server)
            .put('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: issue1._id,
                issue_title: 'Dave',
                issue_text: 'update'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.result, 'successfully updated')
                assert.equal(res.body._id, issue1._id)
                done();
            })
        })
        test('Update issue with missing _id', function (done) {
            chai
            .request(server)
            .put('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: ""
            })
            .end(function (err, res) {
                assert.equal(res.body.error, 'missing _id')
                done();
            })
        })
        test('Update an issue with no fields to update', function (done) {
            chai
            .request(server)
            .put('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: issue1._id,
                issue_title: '',
                issue_text: '',
                created_by: '',
                assigned_to: '',
                status_text: '',
                open: '',
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.error, 'no update field(s) sent')
                done();
            })
        })
        test('Update an issue with an invalid _id', function (done) {
            chai
            .request(server)
            .put('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: 'invalid',
                issue_text: 'update'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.error, 'could not update')
                done();
            })
        })
    })
    suite('Function DELETE', function () {
        test('Delete an issue', function (done) {
            chai
            .request(server)
            .delete('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: issue1._id
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.result, 'successfully deleted')
                done();
            })
        })
        test('Delete an issue with an invalid _id', function (done) {
            chai
            .request(server)
            .delete('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: 'invalid'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.error, 'could not delete')
                done();
            })
        })
        test('Delete issue with a missing _id', function (done) {
            chai
            .request(server)
            .delete('/api/issues/test')
            .set('content-type', 'application/json')
            .send({
                _id: ''
            })
            .end(function (err, res) {
                assert.equal(res.status, 200)
                assert.equal(res.body.error, 'missing _id')
                done();
            })
        })
    })

})
});