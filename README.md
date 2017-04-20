# raml-mocker-server
Fork of raml-mocker-server designed to add platform specific functionality.

Node module to run server mocking API described in RAML files

Objective
---
This plugin make use of [raml-mocker](https://github.com/RePoChO/raml-mocker) module. It run a [Express](http://expressjs.com/) server and configure endpoints and responce from RAML files.

How to use
---

Basic, this will create server on port 3030

```javascript
var api = require('raml-mocker-server');

var options = {
    path: 'test/raml' // path to folder with RAML files
};

var callback = function (app){
	// Express app could be used to configure more paths
    console.log('All RAML files parsed and API endpoints defined');
};

// returns created server
var server = api(options, callback);
```

Tests
---
We're writing tests at an e2e level (due to the small size of the project.) Tests can be run with
```bash
npm test
```

If you would like to add more you can add endpoints in the spec/raml/ directory (it will pick up all files even if we only have one currently) and add an associated unit tests in a *.spec.js file


Options
---

| Name         | Type          | Default value | Description                                                  |
| ------------ | ------------- | ------------- | -------------------------------------------------------------|
| port         | number        | 3030          | defines server port                                          |
| path         | string        | 'raml'        | path to raml folder, relative to the execution context       |
| prefix       | string, array | ''            | prefixing all API endpoints described in RAML                |
| debug        | boolean       |               | enable logging debug info to the console                     |
| watch        | boolean       |               | enable watching on RAML files                                |
| staticPath   | string        |               | defines path to the static folder                            |
| prioritizeBy | string        | 'schema'      | defines the priority of the endpoint response if both 'schema' and 'example' are defined |
| app          | object        |               | if server already exists you can pass express app, Express app, no need to specify *port* and *staticPath* |



#### [Changelog](CHANGELOG.md)

