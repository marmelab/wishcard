define(['underscore','backbone'], function(_, Backbone){
	var Shape =  Backbone.Model.extend({
		defaults: {
			id              : null,
			attributes      : {},
			type            : null,
			classList       : [],
			transform       : null,
			ordering        : 0
		}
		});

	return Shape;
});