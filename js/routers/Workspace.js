define(['views/ShapesView'], function(ShapesView){
	var Workspace = Backbone.Router.extend({
		shapesView: null,

		initialize: function(){
			// Create shapes view
			this.shapesView = new ShapesView();
		}
	});

	return Workspace;
});