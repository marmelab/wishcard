require.config({
	baseUrl: "js/",
	paths: {
		jquery                  : 'libs/jquery-2.0.0',
		underscore              : 'libs/underscore-min',
		'backbone-localStorage' : 'libs/backbone.localStorage',
		backbone                : 'libs/backbone-min',
		eve                     : 'libs/raphael/eve',
		'raphael-core'          : 'libs/raphael/raphael.core',
		'raphael-svg'           : 'libs/raphael/raphael.svg',
		'raphael-vml'           : 'libs/raphael/raphael.vml',
		raphael                 : 'libs/raphael/raphael.amd',
		'raphael-freeTransform' : 'libs/raphael.free_transform'
	},
	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'raphael': {
			exports: 'Raphael'
		},
		'raphael-freeTransform': {
			deps: ['raphael']
		}
	}
});

require(['jquery', 'backbone', 'routers/Workspace'], function($, Backbone, Workspace){
	$(function(){
		var app = new Workspace();
		Backbone.history.start();
	});
});