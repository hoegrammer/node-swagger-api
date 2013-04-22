# NODE SWAGGER API #

Swagger is a specification for describing, producting, consuming, and visualizing RESTful web services.  Node-swagger-api is a tool that consumes Swagger API specs written in js and generates documentation views, and stubbed controllers and integration tests that are compatible with our Node.JS API servers.


## PreRequisites ##

Install Node.JS.  I really like nvm (node version manager) here:  https://github.com/creationix/nvm
```
git clone git://github.com/creationix/nvm.git ~/nvm
. ~/nvm/nvm.sh
nvm run 0.8
```

## General Setup ##

Download the node-swagger-api library:
```
git clone https://github.com/airbnb/node-swagger-api.git
cd node-swagger-api
npm install
```

Initialze the included example:
```
cd example
npm install
```

Quick Start
```
cd example
npm run-script genAll
node app
```

## Generate Documentation ##

*  View, Edit, Add Swagger specification files in node-swagger-api/example/api.  (see https://github.com/wordnik/swagger-core/wiki )

*  Generate swagger documentaion views:
```
cd example
npm run-script genDocs
```

(see package.json for genDocs script definition, or call the script directly:  `node ./scripts/genDocs.js --basePath http://localhost:8080 --copy ./public`)

*  Run the test server
```
cd example
node app -p 8080
```

*  View Swagger docs in the browser
```
http://localhost:8080/api-docs
```

Click on reservation link...

## Generate Controllers ##

*  Generate stubbed controllers based on Swagger spec:

```
cd example
npm run-script genControllers
```

(or call the script directly:  `node ./scripts/genControllers.js --clean`)

*  View controller code in node-swagger-api/example/build/controllers/...  Edit, then move to ./app/controllers directory.

Or, if you'd like to automatically copy controllers (overwriting existing controllers) into the "proper" example run-time directory, use the copy argument:  `node ./scripts/genControllers.js --clean --copy ./app/controllers`

*  Start the server `node app`

*  View available routes from the root directory.  Try the following:
```
http://localhost:8080/
http://localhost:8080/v1/reservations
```


## Generate Tests ##

*  Generate stubbed tests based on Swagger spec:

```
cd example
npm run-script genTests
```

(or call the script directly:  `node ./scripts/genTests.js --clean`)

*  View tests in node-swagger-api/example/build/tests/...  Edit, then move to ./test directory.


Or, if you'd like to automatically copy tests (overwriting existing tests) into the primary test directory, use the copy argument:  `node ./scripts/genTests.js --clean --copy ./test`

*  Run tests
```
npm test
```
