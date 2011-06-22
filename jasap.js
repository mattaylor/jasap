
//dojo.provide("Jasap");

dojo.declare("baseApp", null, {	// uses jsonRest to pintura service for
    
    user : 'Mat Taylor',
    pass : 'free60',
    query: { },
	root : 'root',
	ready: false,
	
    constructor: function(id, options) {
        var my = this;
        if (!(my.id = id)) throw 'no id';
        dojo.mixin(this, options);
        dojo.require("dojo.store.Observable");
		dojo.require("dojo.store.JsonRest");
		dojo.require("dojo.store.Cache");
		dojo.require("dojo.data.ObjectStore");
		dojo.require("dojo.store.Memory");
		dojo.require("dojo.Stateful");
		dojo.require("dojo.hash");
		dojo.require("dojo.cookie");
		my.title   = my.title  || id;
		my.target  = my.target || "/"+ id +"/";
    	dojo.ready(function() { 
    		my.ready   = true;
    		my.cache   = my.cache || new dojo.store.Observable(new dojo.store.Memory());
        	my.store   = my.store || new dojo.store.Cache(new dojo.store.JsonRest({target:my.target}), my.cache);
        	console.log('store : ', my.store);
			dojo.extend(dojo.store.JsonRest, { put: my.save });
			if (my.schema) my.auth(function() { my.show(my.view) });
			else my.auth(function() { dojo.xhrGet({
	            url: this.schemaUrl || "/Class/" + id, handleAs: "json",
				headers: { "accept":"application/javascript, application/json"},
                error: console.log, load: function(res) { my.schema = res; my.show(my.view) }
			})})
    	});	
	},
	
	load  : function(url, prop, then) { 
		dojo.xhrGet({
	    	url: url, handleAs: "json",
			headers: { "accept":"application/javascript, application/json"},
            error: console.log, load: dojo.hitch(this, function(res) { this[prop] = res; then() })
		})
	},

    save  : function(object, options) {
        options = options || {};
        this.target = this.target || this.path;
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
            },
            load:options.load,
        });
    },

    //this.views = dojo.mixin(made, options.views);
    watch  : function(query) {
        query = query || this.query;
//      cache.query(query).observe(function(object, true) {
//          console.log("watching", object);
//          dojo.query("oid="+ object.id +",store="+path).forEach(function(node) {
//          node.innerHTML = views[node.attr("view")](object);
//      })
    },


    auth : function(next) {
    	if (!dojo.cookie("pintura-session")) return dojo.xhrPost({
            url: "/User/", handleAs: "json", headers: {
                "accept": "application/javascript, application/json",
                "content-type": "application/json"
            },
            postData: dojo.toJson({user:this.user, password:this.pass, id:"rpcAuth", method:"authenticate"}),
            error: console.log, load: dojo.hitch(this, next)
  		}); 
  		if (next) return next();
  		return true;
    },

    show  : function(view, object, options) {       // do stuff with views
        console.log('showing: ', view, ' object: ', object, 'options: ', options);

		var my = dojo.mixin(this, options);
		var node, root;
        if (typeof object === "string") return dojo.when(my.store.get(object), function(object) {
        	my.show(view, new dojo.Stateful(object), options);
        });
        if (typeof view === "string") {
        	if (object) my.node = my.id+view+object.id;
  			view = dojo.hitch(my, my[view] || my.micro(my.name+view));
        }
        try { 
        	if (!my.node && object) my.node = my.id+view+object.id;
			node = (typeof my.node === "string") ? dijit.byId(my.node) : my.node;
        	root = (typeof my.root === "string") ? dijit.byId(my.root) : my.root;
        	if (!node) {
            	node = view(object, options);
            	root.addChild(node);
   
        	}  
        	root.selectChild(node);
        } catch(e) { 
        	console.log('show error :', e);
        	console.log('object :', object, 'view :', view, 'node :', node, 'root :'+root, 'options :', options);
        	//if (typeof my.root == "string") my.root = document.getElementById(my.root);
			//if (my.root) my.root.innerHTML +=  view(object, options);
			//else document.write(view(object, options));
        }
    },

    route   : function(hash) {
    },

    micro	: function(viewId) {				// john resigs microtemplating  with handle bars 		
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
   	},
   	
   	view :	function(object, options) {
		console.log('default view');
		var html = "hi there <table>";
		for (var key in object) html += "<tr><td>"+ key +"</td><td>"+ object[key] +"</td></tr>";
		return html+"</table>";
	}
   	
});

dojo.declare('webApp', baseApp, {
	
    constructor: function(id, options) {
		dojo.require("dijit.TitlePane");
		dojo.require("dijit.Editor");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dojox.grid.DataGrid");
		dojo.require("dijit.layout.BorderContainer");
		dojo.require("dijit.form.Form");
		dojo.require("dijit.form.Button");
		dojo.require("dijit.form.ValidationTextBox");
		dojo.require("dijit.form.DateTextBox");
		dojo.require("dijit.layout.TabContainer");
		dojo.require("dojox.form.ListInput");
    },

    listView :  function(options) {             // list items in the store
        var query = options.query || this.query;
        var root  = options.root  || this.root;
        var html = '<ul id="'+ this.store +'list">';
        var items = [];
        dojo.when(store.query(query), function(results) {
            results.forEach(function(object) { items.push(this.views.item(object, options)) });
        });
        this.root.addChild(items);
    },

    tabedView  :  function(options) {  // render views as tabs
        var node = new dijit.layout.TabContainer(dojo.mixin(options, {title:this.id, nested:true, tabPosition:'left' }));
        node.addChild(this.gridView());
        this.root = node;
        return node;
    },

    splitView : function(options) {
    	console.log('splitView this.view=', this.view);
   		var node = new dijit.layout.BorderContainer({title:this.id, region:'center'});
        var root = new dijit.layout.StackContainer({id:this.id+'Stacks', width:'40%', splitter:true, region:'right'});
        var grid = this.gridView({ width:'60%', _height:'100%', region:'center'});
        console.log('got grid:', grid);
        var form = this.formView();
		
		node.addChild(grid);
        node.addChild(root);
        root.addChild(form);
        root.selectChild(form);
        this.root = root;
        return node;
    },

    //itemView : function(object, options) {
    //    var title = object.title || object.id;
    //    return '<b>'+title+'</b>';
    //},

    gridView : function(options) {
    	console.log('grid view', this.store);
    	options = dojo.mixin({
            id    : this.id+'grid',
            title : this.title,
            query : { },
            updateDelay:1,
            region: 'center',
            clientSort: true,
            store : new dojo.data.ObjectStore({objectStore: this.store}),
            style: 'width:100%',
            structure: [ { field: 'id', hidden:true, name: 'id', width:'0' } ]
        }, options);
        for (var key in this.schema.properties) {
            var val = this.schema.properties[key];
            if (key != 'id' && val.type == 'string') options.structure.push({
                field:key, width:Math.round(100/this.schema.properties.length)+'%',name:key
            });
        }
        console.log('grid opts: ', options);
        this.grid = new dojox.grid.DataGrid(options);
        //grid.startup();
        dojo.connect(this.grid,'onRowClick', this, function(){
            this.show('itemView', this.grid.selection.getSelected()[0]);
        });    
        return this.grid;
    },

    formView : function(object, options) {
        object = object || { };
        var my = this;
        var foId = (options && options.nodeId) ? options.nodeId :  my.id+'form'+(object.id || '');
        
        var html ='<form jsId="'+ foId +'" id="'+ foId +'" dojoType="dijit.form.Form"><table class="form">'; 
        if (object.id) html += '<input type="hidden" name="id" value="'+ object.id + '"/>';
        
        for (var key in this.schema.properties) {
        	var prop = this.schema.properties[key];
        	if (prop.readOnly) continue;
        	html += '<tr><td> '+ key +'</td><td>';
        	if (prop.type == 'array') html +=  '<div dojoType="dojox.form.ListInput"  name="'+ key +'" value="'+( object[key] || '') +'"></div></td></tr>';
        	else {
        		html += '<input style="float: right; text-align: left" name="'+ key +'" value="'+ (object[key] || '') +'" dojoType="dijit.form.ValidationTextBox"';
        		if (prop.format == 'date') html += 'displayedValue="'+ (object[key] || '') +'" dojoType="dijit.form.DateTextBox"';
        		html += '/></td></tr>';
        	}
        }
        
		html += '</table>	<input type="submit"/> <button id="'+ foId +'Button" dojoType="dijit.form.Button">Button</button></form>';
        var form = new dijit.form.Form({id:foId});
        
        dojo.connect(form, 'onSubmit', this, function(e) {
            e.preventDefault();
  			dojo.when(this.store.put(dojo.formToObject(foId), {incremental:true}),dojo.hitch(this, function(object) { 
  				alert('saved');
  				//this.grid.setStore(new dojo.data.ObjectStore({objectStore: this.store})); // smells
  				//this.show('itemView', object, {msg:'saved'})
  			}));
      	});
        
        form.domNode.innerHTML = html;
        return this.paneView(dojo.mixin(options, {title:'Edit', id:this.id+'formView'+(object.id || ''), content:form}));
    },

    mainView : function(options) {
    },
    
    
    itemView : function(object, options) { 
    	var tabs = new dijit.layout.TabContainer({doLayout:false, nested:true, style:'overflow:auto; height:100%'}); 
		var pane = new dijit.TitlePane({toggleable:false, style:'_overflow:auto; height:100%', title:object.title || object.id || 'New '+this.id, id:this.id+'itemView'+(object.id || ''), content:tabs});
  		//var pane = new dijit.layout.ContentPane({toggleable:false, style:'_overflow:auto; height:100%', title:object.title || object.id || 'New '+this.id, id:this.id+'itemView'+(object.id || ''), content:tabs});
  		var full  = this.fullView(object, dojo.mixin({title:'Save', _showTitle:false}, options));
    	var edit  = this.formView(object, dojo.mixin({title:'Edit', _showTitle:true}, options));
    	tabs.addChild(full);
    	tabs.addChild(edit);
    	tabs.startup();
    	tabs.selectChild(full);
    	full.showTitle = false;
    	dojo.connect(tabs, 'selectChild', this, function (evt) {
    		var tab = tabs.selectedChildWidget;
    		console.log('Evt :', evt, 'tab :', tab);
            if (tab.title == 'Edit') { 
            	edit.showTitle = false;
            	full.showTitle = true;
            } else if (tab.title == 'Save') { 
            	full.showTitle = true;
            	edit.showTitle = false;
            }
            	//edit.showTitle = true
            	//tab = edit;
            	//var node = dojo.byId(this.id+'formView'+(object.id || '')) || this.formView(object, options);
            	//console.log(node);
             	//tab.set('content', node);
             	//tab.set('title', 'Save');
             //}
            //if (tab.title == 'Save') { 
            //	var node = dijit.byId(this.id+'fullView'+(object.id || '')) || this.fullView(object, options);
            // 	tab.set('content', node);
				//tab.set('content', dojo.byId(this.id+'fullView'+(object.id || '')) ||this.fullView(object, options));
            //	tab.set('title', 'Edit');
            // }
         });
    	//pane.set('content', tabs);
    	tabs.resize();
    	//return this.paneView({id:this.id+'itemView'+(object.id || ''), content:tabs});
    	return pane;
    },

    fullView : function(object, options) {
        object = object || {};
        options = dojo.mixin({
            id: this.id+'fullView'+(object.id || ''),
            title:'Edit',
            //title: object.title || object.id  || '',
            content : '<table>',
            layoutPriority: 1
        }, options);
        for (var key in object) {
            if (key.indexOf(0) != '_') options.content += '<tr><td>'+ key +'</td><td>'+ object[key] +'</td></tr>';
        }
        options.content += '</table>';//<button id="'+defaults.id+'Button" >Edit</button>';
        if (options.msg) options.content = '<div style="border:1px solid; background-colorr:grey; font-weight:bold">'+ options.msg +'</div>'+options.content;
        return this.paneView(options);
    },

    linkView : function(object, options) {
    },

	
    toolView : function(object, options) {
        var tools = new dijit.layout.ToolBar();
    
    	['edit', 'delete', 'new'].each(function(link) {
    		tools.addChild(new dijit.form.Button({ label:link}));
    	});
    	
        for (var i in this.schema.links) {
            //link = linkComp(link, object);
            var link = schema.links[i];
            console.log('got link: ', link);
        	tools.addChild(new dijit.form.Button({
           		label: link.ref
        	}));
        }
    },
	
	
    paneView : function(options) {
        return new dijit.layout.ContentPane(dojo.mixin({title:this.title, splitter:true, region:'right', toggleable:false}, options));
    }	
});


dojo.declare("Jasap", webApp, { 
		
});

