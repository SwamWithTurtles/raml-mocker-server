/* globals require, __dirname, console, afterAll, beforeAll, describe, it, expect */

var api = require('..');
var request = require('request');
var Q = require('Q');
var validUrl = require('valid-url');

var exampleJson = require('./raml/examples/example.json');

var port = '5050';

function get(path) {
    var dfd = Q.defer();

    request('http://localhost:' + port + path, function(error, response, body) {
        if(error) {
            return dfd.reject(error);
        }

        dfd.resolve(body);
    });

    return dfd.promise;
}

function post(path, data) {
    var dfd = Q.defer();

    request.post('http://localhost:' + port + path, data, function(error, response, body) {
        if(error) {
            return dfd.reject(error);
        }

        dfd.resolve(response, body);
    });

    return dfd.promise;
}

describe("Given a running RAML Mocker Server", function () {

    var server;

    beforeAll(function (done) {
        var options = {
            path: 'spec/raml',
            debug: true,
            watch: true,
            port: port,
            prefix: ['', '/api'],
            prioritizeBy: 'example',
            staticPath: __dirname
        };

        server = api(options, done);
    });

    describe("when a user requests data from an endpoint defined by an example json", function() {
        var responseBody;

        beforeAll(function (done) {
            get('/example-json')
                .then(function(body) {
                    responseBody = body;
                })
            .then(done);
        });

        it("then it should return the json", function() {
            expect(responseBody).toBe(JSON.stringify(exampleJson));
        });

    });

    describe("when a user requests data from an endpoint defined by a schema", function() {
        var responseBody;

        beforeAll(function (done) {
            get('/generated-values')
                .then(function(body) {
                    responseBody = JSON.parse(body);
                })
                .then(done);
        });

        it("then the array should be constructed as an array", function() {
            expect(responseBody).toHaveNonEmptyArray("arrayOfObjects");
        });

        it("then the numeric 'id' value should be a number", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveNumber("identifier");
        });

        it("then the string value 'text' should be a string", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveString("text");
        });

        it("then the timestamp field is listed as a whole number (of ms)", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveWholeNumber("date");
        });

        it("then the numeric field is listed as a number", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveNumber("number");
        });

        it("then the boolean field should be true or false", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveBoolean("isTrue");
        });

        it("then the numeric field defined by an indirect reference should be a number", function() {
            expect(responseBody.arrayOfObjects[0]).toHaveNumber("test");
        });

        it("then there is a field formatted either as a URI or an IPv4", function() {
            var anyOfField = responseBody.arrayOfObjects[0].anyOfTest;
            var IPV4_REGEX = new RegExp("^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");

            expect(validUrl.isUri(anyOfField) || anyOfField.match(IPV4_REGEX)).toBeTruthy();
        });
        
        it("then the object constructed from multiple constraints are all met", function() {
           var allOfField = responseBody.arrayOfObjects[0].allOfTest;

           expect(allOfField).toHaveString("prop1");
           expect(allOfField).toHaveWholeNumber("prop2");
        });
    });

    describe("when a user requests data from an endpoint defined by an object literal", function() {
        var responseBody;

        beforeAll(function (done) {
            get('/example-literal')
                .then(function(body) {
                    responseBody = JSON.parse(body);
                })
                .then(done);
        });
        
        it("then response equals the object literal", function() {
            expect(responseBody).toEqual({"test": "test"});
        });
    });

    describe("when a user requests data from an endpoint with a schema listed (first) and an example listed", function() {
        var responseBody;

        beforeAll(function (done) {
            get('/schema-first')
                .then(function(body) {
                    responseBody = JSON.parse(body);
                })
                .then(done);
        });

        it("then the response equals the example listed", function() {
            expect(responseBody).toEqual({"test": "test"});
        });
    });

    describe("when a user requests data from an endpoint with an example listed (first) and a schema listed", function() {
        var responseBody;

        beforeAll(function (done) {
            get('/example-first')
                .then(function(body) {
                    responseBody = JSON.parse(body);
                })
                .then(done);
        });

        it("then the response equals the example listed", function() {
            expect(responseBody).toEqual({"test": "test"});
        });
    });

    describe("when a user requests data from an endpoint with a parameter as part of its URI", function() {
        var responseBody;

        beforeAll(function (done) {
            var ID = Math.floor(Math.random() * 10000);

            get('/parameter/' + ID)
                .then(function(body) {
                    responseBody = JSON.parse(body);
                })
                .then(done);
        });

        it("then response equals the object literal", function() {
            expect(responseBody).toEqual({"test": "test"});
        });
    });

    describe("when a user requests data from endpoints defined in a nested manner", function() {
        var fooResponse, barResponse;

        beforeAll(function (done) {
            get('/nested/foo')
                .then(function(body) {
                    fooResponse = JSON.parse(body);
                })
                .then(function() {
                    return get('/nested/bar')
                })
                .then(function(body) {
                    barResponse = JSON.parse(body)
                })
                .then(done);
        });

        it("then the response from the 'foo' endpoint returns foo", function() {
            expect(fooResponse.value).toBe("foo");
        });

        it("then the response from the 'bar' endpoint returns bar", function() {
            expect(barResponse.value).toBe("bar");
        });
    });

    describe("when a user POSTS data to an endpoint", function() {
        var responseBody, statusCode;

        beforeAll(function (done) {
            post('/post', {})
                .then(function(response) {
                    responseBody = JSON.parse(response.body);
                    statusCode = response.statusCode;
                })
                .then(done);
        });

        it("then the status code equals 201 (as defined in the RAML)", function() {
            expect(statusCode).toBe(201);
        });

        it("then response equals the object literal", function() {
            expect(responseBody).toEqual({"test": "test"});
        });
    });

    afterAll(function () {
        server.close();
    });

});