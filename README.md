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

With these simple commands:
```var Restizr = require('restizr');
var rest = new Restizr(app);  // ExpressJS app
rest.map(User);```

Will create the following endpoints:
POST /api/user
GET /api/user/<id>
DELETE /api/user/<id>
PUT /api/user/<id>

## Options

TBD

## Callbacks

TBD

## Examples on the real world

TBD

## Known issues
Currently the module it's in an alpha stage. Error handling is not well supported.



