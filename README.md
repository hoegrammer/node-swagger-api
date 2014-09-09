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
git clone https://github.com/braitz/node-swagger-api.git
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

(see package.json for genDocs script definition, or call the script directly:  `node ./scripts/genDocs.js --basePath http://localhost:3030 --copy ./public`)

*  Run the test server
```
cd example
node app -p 3030
```

*  View Swagger docs in the browser
```
http://localhost:3030/api-docs
```

Click on reservation link...

## Generate Controllers ##

*  Generate stubbed controllers based on Swagger spec:

```
cd example
npm run-script genControllers
```

This will create controllers in the ./app/controllers, overwriting existing ones. If you want to build them in a temporary location first, use node `./scripts/genControllers.js` which will save them to ./build/controllers

node ./scripts/genControllers.js`

*  Start the server `npm start`

*  View available routes from the root directory.  Try the following: `http://localhost:3030/`


## Generate Tests ##

*  Generate stubbed tests based on Swagger spec:

```
cd example
npm run-script genTests
```

This will create tests in the ./test dir, overwriting existing tests. If you want to build them in a temporary location first, use node `./scripts/genTest.js` which will save them to ./build/test

*  Run tests
```
npm test
```
