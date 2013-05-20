require.config({
	baseUrl: "js/",
	paths: {
		jquery                        : 'libs/jquery-2.0.0',
		underscore                    : 'libs/underscore-min',
		'backbone-localStorage'       : 'libs/backbone.localStorage',
		backbone                      : 'libs/backbone-min',
		eve                           : 'libs/raphael/eve',
		'raphael-core'                : 'libs/raphael/raphael.core',
		'raphael-svg'                 : 'libs/raphael/raphael.svg',
		'raphael-vml'                 : 'libs/raphael/raphael.vml',
		raphael                       : 'libs/raphael/raphael.amd',
		'raphael-freeTransform'       : 'libs/raphael.free_transform',
		'raphael-inline_text_editing' : 'libs/raphael.inline_text_editing'
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
		},
		'raphael-inline_text_editing': {
			deps: ['jquery','raphael']
		}
	}
});

require(['jquery', 'backbone', 'views/ShapesView'], function($, Backbone, ShapesView){
	$(function(){
		// Initiate main view
		var shapesView = new ShapesView();
	});
});