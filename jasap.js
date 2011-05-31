
/** 
 * Jasap is a micro mvc application framework built ontop of dojo to support rapid developement of rich single page apps
 * based on a json-schema restfull data api's. JASAP aims to  enable the scaffolding of complete usable UI's for navigating and interacting with 
 * JsonRest data stores with a single line of code, whilst also supporting  
 * Basic Features..
 * 1. Views : Schema based automated rendering of forms, grids, search results, lists, and item detials.
 * 2. Links : Support for complex relations between schemas. 
 * 3. Mobile: Support for mobile views. 
 * 4. Refers: Automatic resolution of json-references. 
 * 3. State : Instant updates of views 
 * 4. Comet : Real time updates
 * 5. Routes: Support for back button an bookmarking of views.
 * 7. Model : JsonRest, Schema support, Data caching and 
 * 8. Control: Support for DataStore bound templates, History managment, auth via facebook etc..
 * 9.
 * schema extensions:
 * 1. scope  
 * 2. labels
 * 3. views : a label
 * ToDo
 * * dojo.declare
 * * views as functions
 * * splitView 	// view to render the Module as a slit Pane with list or grid a 
 * * listView  // view to render a list of items
 * * itemView  // view to render items in a list
 * * mainView  // view to host the other views
 * * toolView  // View to render controls for interaction with the schema or item
 * * fullview  // View to render a complete representation of an item
 * * initView  // View to use when first loading the Module
 * * linkView  // View to render links within the schema.
 * * methView  // View to render Methods associated with this item.
 * * formView  // View to render the item as an editable form.
 * * gridView  // View to render items in a list
 * * jsonSchema in Link 'desribedBy' headers
 * * Link rendering - support for targetSchema's
 * * statefull updates
 * * tests for inheritance
 * * simple schema extensions (label, views, format for html)
 * * Comet support
 * * json refs
 * * smd
 * * form updates
 * * routes
**/

dojo.require("dijit.TitlePane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Editor");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.store.JsonRest");
dojo.require("dojo.store.Cache");
dojo.require("dojo.data.ObjectStore");
dojo.require("dojo.store.Memory");
dojo.require("dojo.store.Observable");	
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dojo.hash");  

function Jasap(name, options) {
//dojo.declare('Jasap', schemaViews, { constructor: function(name, options) {
	var my   = this;
	options  = options || {};
	my.name  = name;
	my.title = options.title || name;
	my.query = options.query || {};
	my.root	 = typeof options.root === 'object' ? options.root : dijit.byId(options.root) || dijit.byId('root');
	my.path  = options.path || '/'+my.name +'/';
	my.cache = new dojo.store.Observable(new dojo.store.Memory());
	my.store = new dojo.store.Cache(new dojo.store.JsonRest({target:my.path}), my.cache);
	
	my.save  = function(object, options) { 
		options = options || {};
		this.target = this.target || my.path;
		var id = ("id" in options) ? options.id : this.getIdentity(object);
		var hasId = typeof id != "undefined";
		return dojo.xhr(hasId && !options.incremental ? "PUT" : "POST", {	
			url: hasId ? this.target + id : this.target,	
			postData: dojo.toJson(object), handleAs: "json",
			headers: {	
				"Content-Type": "application/json",	
				"If-Match": options.overwrite === true ? "*" : null, 	
				"If-None-Match": options.overwrite === false ? "*" : null, 	
				"Accept": "application/javascript, application/json"
			}
		});
	};

	//my.views = dojo.mixin(made, options.views);
	my.watch  = function(query) { 
		query = query || my.query;
//		cache.query(query).observe(function(object, true) {
//			console.log('watching', object);
//			dojo.query("oid="+ object.id +",store="+path).forEach(function(node) { 
//			node.innerHTML = views[node.attr('view')](object);
//		})
	}
	
	my.schema = options.schema || '/Class/' + my.name;
	my.user = '';
	
	my.auth = function(user, pass, load) { 
		dojo.xhrPost({ 
			url: '/User/', handleAs: 'json', headers: {
				"accept": "application/javascript, application/json",
				"content-type": "application/json"
			},
			postData: dojo.toJson({user:user, password:pass, id:'rpcAuth', method:'authenticate'}), 
			error: console.log, load: function(res) { 
				my.user = user;
				load(); 
			}
		})
	};
	
	dojo.extend(dojo.store.JsonRest, { put: my.save });
	
	my.load = function() {
		if (!my.user) return my.auth('Mat Taylor', 'free60', my.load );
		if (typeof my.schema == 'object') my.rend('init');
		else dojo.xhrGet({
			url: my.schema, handleAs: 'json', headers: {
				'accept': 'application/javascript, application/json'
			}, error: function(err) {
				//console.log('Unable to Find Schema '+my.name, err);
				my.schema = { properties:{id:{type:'string'}}};
				my.rend('init');
			}, load: function(res) {
				console.log(res);
				my.schema = res;
				my.rend('init');
			}
		});
	}
	
	my.rend	=  function(view, object, options) {		// do stuff with views
		if (typeof object === 'string') return dojo.when(my.store.get(object), function(object) {
			my.rend(view, new dojo.Statefull(object), options);
		});
		//if (typeof view === 'string') view = my.views[view];
		if (!my.views[view]) my.views[view] = my.micro(my.name+view) || my.views.full;
		var root   = (options && options.root) ? options.root :  my.root;
		var nodeId = (options && options.id )  ? options.id   : (object && object.id) ? my.name+view+object.id : my.name+view+'0';
		var node = dijit.byId(nodeId);
		if (!node) {
			node = my.views[view](object, options);
			root.addChild(node);
		}
		root.selectChild(node);
	}
	
	my.route	= function(hash) { 					// handle changes to hash
	}
	
	my.micro	= function(viewId) {				// john resigs microtemplating  with handle bars 		
   		var view = document.getElementById(viewId).innerHTML;
   		if (!view) return console.log('No Template '+viewId);
   		var value = "var out = ''; out+=" + "'" +
        view.replace(/[\r\t\n]/g, " ")
           .replace(/'(?=[^%]*%>)/g,"\t")
           .split("'").join("\\'")
           .split("\t").join("'")
           .replace(/\{\{(.+?)\}\}/g, "'; out += $1||''; out += '")
           .split("\{%").join("';")
           .split("%\}").join("out+='")
           + "'; return out;";       
		return new Function("my", value);
   	}

	my.views =  {
	init :  function(options) { 				// Initial view 
		return my.views.grid(options);	
	},
		
	list :  function(options) {				// list items in the store
		var query = options.query || my.query;
		var root  = options.root  || my.root;
		var html = '<ul id="'+ my.store +'list">';
		var items = [];
		dojo.when(store.query(query), function(results) { 
			results.forEach(function(object) { items.push(my.views.item(object, options)) });
		});
		root.addChild(items);
	},
		
	item :  function(object, options) {
		var title = object.title || object.id;
		return '<b>'+title+'</b>';
	},
		
	grid : function(options) {
		var defaults = {
			id	  : my.name+'grid',
			title : my.title,
			query : {},
			store : new dojo.data.ObjectStore({objectStore: my.store}),
			style: 'width:100%',
			structure: [ { field: 'id', hidden:true, name: 'id', width:'0' } ]
		}	
		for (var prop in my.schema.properties) if (prop != 'id') defaults.structure.push({ field:prop, width:Math.round(100/my.schema.properties.length)+'%',name:prop });
		var grid = new dojox.grid.DataGrid(dojo.mixin(defaults, options));
		dojo.connect(grid,'onRowDblClick',function(){
			my.rend('full', grid.selection.getSelected()[0]);
		});	
		return grid;
	},
		
	form : function(object, options) {
		options.id = options.id || 'form'+my.name+object.id;
		var html = '<table class="form">';
		if (object.id) html += '<input type="hidden" name="id" value="'+ object.id + '"/>';
		for (var key in schema.properties) if (!schema.properties[key].readOnly) {
			html += '<tr><td> '+ key +'</td><td><input name="'+ key +'" value="'+ [key] +'"/>'
		}
		var form = new dijit.form.Form(options, html);			
		dojo.connect(form, 'onSubmit', function() {
			dojo.when(store.put(dojo.formToObject(options.id), {incremental:true}), function(object) { 
				open('full', object, {'msg':'saved'});
			})
		});
		return form;
	},
		
	main : function(options) { 
	},
		
	full : function(object, options) {
		var defaults = {
			id: my.name+'full'+object.id,
			title: object.title || object.id,
			content : '<table>'
		}
		for (var key in object) { 
			if (key.indexOf(0) != '_') defaults.content += '<tr><td>'+ key +'</td><td>'+ object[key] +'</td></tr>';
		}
		defaults.html += '</table>';
		return dijit.TitlePane(dojo.mixin(defaults, options));
	},
		
	menu : function(object, options) {
		for (var link in schema.links) { 
			link = linkComp(link, object);
			console.log(link);
		}
		for (var meth in schema.methods) { 	
		}
	},	
				
	pane : function(options, content) { 
		return new dijit.TitlePane(dojo.mixin({title:my.title, id:name+'pane'+options.id}, options));
	}	
	}
	my.views =  dojo.mixin(my.views, options.views);
}



	
		