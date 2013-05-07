define(['underscore','backbone', 'models/Shape', 'backbone-localStorage'], function(_, Backbone, Shape){
	var Shapes = Backbone.Collection.extend({
		model: Shape,
		url: 'shapes',
		localStorage: new Backbone.LocalStorage("shapes")
	});

	return Shapes;
});