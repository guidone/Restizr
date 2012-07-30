var extend = require( 'node.extend' );

var engines = {
		sequelize: {
			// serialize an object
			serialize: function(record,model) {
				var obj = {};
				var idx = 0;
				var attributes = this.attributes(model);
				for (idx = 0; idx < attributes.length; idx++) {
					obj[attributes[idx]] = record[attributes[idx]];
					}
				return obj;	
				}, // end serialize
			
			id: function(model) {
				
				var that = this;
				
				return function(req,res,next) {
					
					// get id and convert to numeric
					var id = req.param('id'); // the id is standard for restizr
					id = that.isKeyNumeric(model) ? parseInt(id,10) : id;					
					req.id = id;
					
					return next();					
					}; // end middleware				
				
				},
			
			
			get: function(model) {				
				return function(req,res,next) {
					// find the record
					model.find(req.id)
						.success(function(record) {						
							if (record != null) {								
								req.record = record;
								return next();
								}
							else return next('error che non esiste');
							})
						.failure(function() {
							return next('err');
							})	
					}; // end returned middleware				
				}, // end get
			
			parse: function(model) {
				
				var that = this;
				var primaryKey = that.getPrimaryKey(model);
				var attributes = that.attributes(model);
				
				//console.log('model');
				//console.log(model);
				
				return function(req,res,next) {
					
					// init					
					var record = null;
					var idx = 0;
					var tmp = null;
					
					// collect attributes
					for (idx = 0; idx < attributes.length; idx++) {
						var attribute = attributes[idx];
						
						if (attribute != primaryKey) {
							var attribute_type = model.rawAttributes[attribute].type;
							tmp = req.param(attribute);
							if (tmp != null) {
								// create record if not exists
								if (record == null) record = {};
								
								if (attribute_type == 'TINYINT(1)') {
									record[attribute] = tmp == 'true' || tmp == '1' || tmp == 'on';
									}
								else if (attribute_type == 'INTEGER') {									
									tmp = parseInt(tmp,10);
									if (!isNaN(tmp))
										record[attribute] = tmp;									
									} 
								else if (attribute_type == 'DATE' || attribute_type == 'DATETIME') {
									try {
										var d = new Date(tmp);
										record[attribute] = d;										
										}
									catch(e) {
										// do nothing
										}									
									
									} 
								else record[attribute] = tmp;
	// parse other fields here
								
								} // if key exists
							} // end fi not primary key					
						} // end for
					// store
					req.parsed_record = record;
					
					return next();					
					};
				
				},
			
			post: function(model) {
				
				var that = this;
				
				return function(req,res,next) {
					// check if record not null
					//if (req.record == null)
					//	return next('error');
					//else {
						
						var new_record = model.build(req.parsed_record);						
						new_record.save()
							.success(function(new_record) {
								req.record = new_record;								
								return next();
								})
							.error(function() {								
								return next('erroraccio su insert');
								});
						
					//	}
					} // end middleware
				
				},

			put: function(model) {
				
				var that = this;
				var primaryKey = that.getPrimaryKey(model);
				var attributes = that.attributes(model);
				
				return function(req,res,next) {
								
					// check if record not null
					if (req.record == null)
						return next('error');
					else {
					
						// collect changed fields
						var idx = 0;
						for(idx = 0; idx < attributes.length; idx++) {
							if (req.parsed_record[attributes[idx]] != null &&
								attributes[idx] != primaryKey)
								req.record[attributes[idx]] = req.parsed_record[attributes[idx]];
							}
						// save
						req.record.save()
							.success(function(record) {
								req.record = record;
								return next();
								})
							.error(function() {
								
								return next('error');
								});
						
						}
					}; // end middleware
				
				},
			
			del: function(model) {
				
				var that = this;
				
				return function(req,res,next) {
				
					// check if record not null
					if (req.record == null)
						return next('error');
					else {
						// remove a record
						req.record.destroy()
							.success(function() {
								return next();
								})
							.error(function() {
								return next('error');
								});					
						}					 
					 };
				
				
				},
			
			
			out: function(model,onSerialize) {
				
				var that = this;
				 
				return function(req,res,next) {
					var result = {error: false,success: true};
					// build the result
					result[model.name.toLowerCase()] = [that.serialize(req.record,model)];
					// put on stack
					req.response = result;
					return next();
					};
				},
			
			
			all: function(model,onSerialize) {
				
				var that = this;
				
				return function(req,res,next) {
					var result = {error: false};
					
					model.findAll(req.queryString)
						.success(function(result) {
							
							if (result != null && result.length != 0) {
								var stack = [];								
								// serialize result
								result.forEach(function(record) {	

									stack.push(
										that.serialize(record,model)
										);
									});
								// build the result
								req.response = {};
								req.response['error'] = false;
								req.response[model.name.toLowerCase()] = stack;

								}
							else {
								req.response = [];
								}
							// then pass over	
							return next();
							})
						.error(function() {
							return next('error');
							});	
					};
				},
			
			
			attributes: function(model) {
				
				var result = [];
				
				for (var key in model.rawAttributes) {
					if (key != 'createdAt' && key != 'updatedAt')
						result.push(key);
					}
				
				return result;
				},
				
			isKeyNumeric: function(model) {
				return true;
				},
				
			getPrimaryKey: function(model) {
				return 'id';
				},	
				
			unserialize: function(record,model) {
			
			
				} // unserialize
			
			}
		
		
		
		};



module.exports = function(app) {
/*	
	var opts = opts != null ? opts : {};
	var default_options = {
		id: 'id',
		basepath: '/api',
		engine: 'sequelize'	
		};
	var options = opts.extend(default_options); 
*/	
	// select the engine
	
	
	
	
	return {
		
		map: function(model,opts) {
		
			//basepath = basepath != null && basepath !== '' ? basepath : '/api';
			var opts = opts != null ? opts : {};
			var default_options = {
				regexp: null,
				basepath: '/api',
				engine: 'sequelize',
				limit: 10,
				onBefore: null,
				onAfter: null,
				onBeforeAll: null,
				onAfterAll: null,
				onBeforeGet: null,
				onAfterGet: null,
				onBeforePost: null,
				onAfterPost: null,
				onBeforePut: null,
				onAfterPut: null,
				onBeforeDelete: null,
				onAfterDelete: null,
				onResponse: null			
				};
			var options = extend(default_options,opts);

			var engine = engines[options.engine];						
			var restUrl = options.basepath+'/'+model.name.toLowerCase();
			
			console.log('Attaching end point: '+restUrl);
			
			// list elements
			app.get(
				restUrl,
				function (req,res,next) {
					
					var offset = req.param('offset',0);
					var limit = req.param('limit',options.limit);
					// build query string
					req.queryString = {
						offset: offset, 
						limit: limit 
						};
					
					return next();
					},				
				options.onBefore != null ? options.onBefore : [],
				options.onBeforeAll != null ? options.onBeforeAll : [],				
				engine.all(model),
				options.onAfterAll != null ? options.onAfterAll : [],
				options.onBefore != null ? options.onBefore : [],
				function(req,res,next) {
					res.send(req.response);
					}
				);
			
			// get a single element
			app.get(
				restUrl+'/:id',
				engine.id(model),
				options.onBefore != null ? options.onBefore : [],
				options.onBeforeGet != null ? options.onBeforeGet : [],
				engine.get(model),
				options.onAfterGet != null ? options.onAfterGet : [],
				options.onAfter != null ? options.onAfter : [],
				engine.out(model,options.onOutput),
				options.onResponse != null ? options.onResponse : [],
				function(req,res,next) {
					res.send(req.response);
					}
				);
			// add an element
			app.post(
				restUrl,
				engine.parse(model),
				options.onBefore != null ? options.onBefore : [],
				options.onBeforePost != null ? options.onBeforePost : [],
				engine.post(model),
				options.onAfterPost != null ? options.onAfterPost : [],
				options.onAfter != null ? options.onAfter : [],
				engine.out(model,options.onOutput),
				options.onResponse != null ? options.onResponse : [],
				function(req,res,next) {
					res.send(req.response);
					}				
				);
			// modify an element
			app.put(
				restUrl+'/:id',
				engine.id(model),
				engine.parse(model),
				options.onBefore != null ? options.onBefore : [],
				options.onBeforePut != null ? options.onBeforePut : [],
				engine.get(model),			
				engine.put(model),
				options.onAfterPut != null ? options.onAfterPut : [],
				options.onAfter != null ? options.onAfter : [],
				engine.out(model,options.onOutput),
				options.onResponse != null ? options.onResponse : [],
				function(req,res,next) {
					res.send(req.response);
					}				
				);
			// delete a record	
			app.del(
				restUrl+'/:id',
				engine.id(model),
				options.onBefore != null ? options.onBefore : [],
				options.onBeforeDelete != null ? options.onBefore : [],
				engine.get(model),
				engine.del(model),
				options.onAfterDelete != null ? options.onAfterDelete : [],
				options.onAfter != null ? options.onAfter : [],
				function(req,res,next) {					
					res.response = {error: false};
					return next();
					},
				options.onResponse != null ? options.onResponse : [],
				function(req,res,next) {
					res.send(req.response);
					}				
				);
			
			
			} // end map
		}; // end this
	}; // end restizr