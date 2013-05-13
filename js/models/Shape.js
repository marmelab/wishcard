define(['underscore','backbone'], function(_, Backbone){
	var Shape =  Backbone.Model.extend({
		defaults: {
			id              : null,
			attributes      : {},
			type            : null,
			classList       : [],
			transform       : null,
			ordering        : 0
		},

		initialize: function Shape(){
			var self = this;

			this.url = function(){
				return 'shape/' + self.id;
			};

		}
	});

	return Shape;
});