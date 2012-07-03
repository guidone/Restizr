# Restizr
Restizr is a lightweight **REST** layer for NodeJS+ExpressJS+Sequelize: given a Sequelize model, automatically creates the REST end points (GET,PUT,POST,DELETE) at specific URL.

## Example
For example, given the model
```var User = sequelize.define('User', {
	id: { 
		type: Sequelize.INTEGER, 
		autoIncrement: true, 
		primaryKey: true
		},	
  username: { 
		type: Sequelize.STRING
		},
  password: { 
		type: Sequelize.STRING
		}
	});```

These simple commands:
```var Restizr = require('restizr');
var rest = new Restizr(app);  // ExpressJS app
rest.map(User);```

will create the following REST endpoints:
- GET /api/user: list first 10 records of the table "user". Accepts parameter limit and offset (for example /api/user?limit=20&offset=10)
- GET /api/user/<id>: get the record with primary key <id> from the table "user"
- POST /api/user: create a new entry in the table "user", returns the primary key of the new record
- DELETE /api/user/<id>: delete the record with primary key <id> from the table "user"
- PUT /api/user/<id>: update the record with primary key <id> from the table "user"

Where *id* is the primary key in the MySQL  table.

## Options

- basepath(default: '/api'): change here to attach the resource REST API to a specific end point
- engine(default: 'sequelize'): the engine used for the storage, currently only Sequelize in supported
- limit(default: 10): number of records returned while listing
- onBefore,onAfter: middlewares executed at the before each request, this is a good place to check session for securing the calls to APIs
- onBeforeAll,onAfterAll: middlewares execute before and after the listing of the records
- onBeforeGet,onAfterGet:
- onBeforePost,onAfterPost:
- onBeforePut,onAfterPut
- onBeforeDelete,onAfterDelete: 

## Using middlewares

Restizr accepts a number of middlewares to be executed before or after the sigle REST operation in order to perform basic operation, for example check credentials of the client or format the output.

....


## Examples on the real world

TBD

## Known issues
Currently the module it's in an alpha stage. Error handling is not well supported.



