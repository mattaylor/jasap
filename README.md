WARNING - pre-alpha, not 

Jasap will be be a simple micro mvc application framework built ontop of dojo to support rapid developement of rich single page apps based on a json-schema restfull data api's. 
JASAP aims to enable the scaffolding of complete usable Web UI's for navigating and interacting with 
JsonRest data stores with a single line of code, whilst also supporting easy extension and additons to the bundled views for building full customised applications.

''Features''
* 1. Views : Schema based automated rendering of forms, grids, search results, lists, and item detials.
* 2. Links : Support for complex relations between schemas. 
* 3. Mobile: Support for mobile views. 
* 4. Refers: Automatic resolution of json-references. 
* 3. State : Instant updates of views 
* 4. Comet : Real time updates
* 5. Routes: Support for back button an bookmarking of views.
* 7. Model : JsonRest, Schema support, Data caching and 
* 8. Control: Support for DataStore bound templates, History managment, auth via facebook etc..

''Proposed Schema Extensions''
* 1. label : An optional property as a string to indicated the label to use for redering this property, method or link.
* 2. scope : An optional property as an array of strings to tag this this property, method or link for use by views

''ToDo : Classes''
* Class Hirachy based on dojo.declare 
* 'rawAp' // Simple Application base class from which 
* 'jasAp' // Extend rawApp to support Pintura/Persevere based JsonRest API's
* 'webAp' // Extend rawApp to support basic WebViews as outlined below
* 'mobAp' // Extend rawApp to support Mobile views
* 'tabAp' // Extend base App with views for tablets 

''ToDo : jasAp''
* Support schema links and targetSchema's
* Support Statefull/Observable updates to active views
* Support Comet/Websocket based updates 
* Support json-ref
* Support json-interfaces
* form updates
* routing / hash / back button management

''ToDo: webApp''
* splitView // view to render the Module as a slit Pane with list or grid a 
* listView  // view to render a list of items
* itemView  // view to render items in a list
* mainView  // view to host the other views
* toolView  // View to render controls for interaction with the schema or item
* fullview  // View to render a complete representation of an item
* initView  // View to use when first loading the Module
* linkView  // View to render links within the schema.
* methView  // View to render Methods associated with this item.
* formView  // View to render the item as an editable form.
* gridView  // View to render items in a list

''ToDo: MobViews''
* Lots..
 
