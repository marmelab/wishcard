define(['views/ShapesView'], function(ShapesView){
	var Workspace = Backbone.Router.extend({
		shapesView: null,

		initialize: function(){
			this.shapesView = new ShapesView();
		}
	});

	return Workspace;
});