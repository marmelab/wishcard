(function($){
	var Form =  Backbone.Model.extend({
		defaults: {
			id              : null,
			attributes      : {},
			type            : null,
			classList       : [],
			transform       : null
		},

		initialize: function Form(){
			var self = this;

			this.url = function(){
				return 'forms/' + self.id;
			}
		}
	});

	var Forms = Backbone.Collection.extend({
		model: Form,
		url: 'forms',
		localStorage: new Backbone.LocalStorage("forms")
	});

	var FormView = Backbone.View.extend({
		el        : $('#editor'),
		paper     : null,
		forms     : null,
		elements  : null,
		ft        : null,
		selected  : null,
		willInsert: false,

		initialize: function(){
			// Initialize Raphael paper
			this.paper = Raphael(document.getElementById('canvas_container'), 630, 444);
			this.elements = this.paper.set();
			var self = this;

			// Retrieve forms
			this.forms = new Forms();

			this.forms.fetch({success: function(model, response){
				// Parse saved forms
				_.each(response, function(model){

					self.displayForm(model);
				});
			}});

			this.forms.bind('sync', function(model){
				if(!self.willInsert){
					return;
				}

				self.displayForm(model.attributes);

				self.willInsert = false;
			});
		},

		displayForm: function(model){
			// Merge the type with the model attributes field
			var attributes = jQuery.extend(model.attributes, {type : model.type});

			// Display the element on the paper
			var raphaelElements = this.paper.add([attributes]);
			var raphaelElement = raphaelElements[0];

			// Add the element to the current set
			this.elements.push(raphaelElement);

			// Add css classes
			for(var i = 0, len = model.classList.length; i < len; i++){
				raphaelElement.node.classList.add(model.classList[i]);
			}

			// Store model id
			$(raphaelElement.node).attr('data-id', model.id);

			// Apply transformation
			if(model.transform != null){
				var ft = this.paper.freeTransform(raphaelElement);
				ft.hideHandles();

				ft.attrs.rotate = model.transform.rotate;
				ft.attrs.scale = model.transform.scale;
				ft.attrs.translate =  model.transform.translate;

				ft.apply();
				ft.unplug();
			}

		},

		events: {
			'click #insert_rect'                          : 'addRect',
			'click #insert_circle'                        : 'addCircle',
			'click #canvas_container svg .movable'        : 'selectElement',
			'click #canvas_container svg .movable tspan'  : 'selectElement',
			'mouseover #canvas_container svg .movable'    : 'revealSelectableElement',
			'mouseout #canvas_container svg .movable'     : 'blurSelectableElement',
			'unselect #canvas_container svg .movable'     : 'unselectElement',
			'click #canvas_container'                     : 'unselectAll'
		},

		addRect: function(){
			this.willInsert = true;

			var element = this.paper.rect(250, 250, 100, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			var rect = new Form({attributes: element.attrs, type: element.type, classList: Array.prototype.slice.call(element.node.classList)});
			element.remove();

			this.forms.add(rect);
			rect.save();
		},

		addCircle: function(){
			this.willInsert = true;

			var element = this.paper.circle(250, 250, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			var circle = new Form({attributes: element.attrs, type: element.type, classList: Array.prototype.slice.call(element.node.classList)});
			element.remove();

			this.forms.add(circle);
			circle.save();
		},

		selectElement : function(e) {
			if (this.selected !== null) {
				$(this.selected.node).trigger('unselect');
			}

			var rafel = this.getRaphaelElement(e.target);
			this.selected = rafel;

			rafel.node.classList.add('selected');
			this.ft = this.paper.freeTransform(rafel);

			this.blurSelectableElement(rafel);

			e.stopPropagation();
		},

		unselectElement : function(e) {
			this.ft.unplug();
			e.target.classList.remove('selected');

			var rafael = this.getRaphaelElement(e.target);
			var formId = $(rafael.node).attr('data-id');

			var f = this.forms.get(formId);
			f.attributes.attributes = rafael.attrs;
			f.attributes.transform = {
				rotate : this.ft.attrs.rotate,
				scale: this.ft.attrs.scale,
				translate : this.ft.attrs.translate
			};
			f.save();

			this.selected = null;
		},

		revealSelectableElement: function(e) {
			if (e.target.classList.contains('selected')) return;

			var rafael = this.getRaphaelElement(e.target);
			var currentAttrs = rafael.attr();

			rafael.data('savedAttributes', {
				stroke: currentAttrs.stroke,
				cursor: currentAttrs.cursor,
				'stroke-width': currentAttrs['stroke-width']
			});

			rafael.attr({
				stroke: '#00f',
				cursor: 'default',
				'stroke-width': '1px'
			});

			e.stopPropagation();
		},

		blurSelectableElement: function(e) {
			var rafel = e.matrix ? e : this.getRaphaelElement(e.target);
			rafel.attr(rafel.data('savedAttributes'));
		},

		unselectAll: function(e) {
			if (!e.target.classList.contains('movable') && this.selected && this.ft) {
				$(this.selected.node).trigger('unselect');
			}
		},

		getRaphaelElement: function(element) {
			var raphaelId;

			if (element.raphaelid !== undefined) {
				raphaelid = element.raphaelid;
			} else if (element.parentNode && element.parentNode.raphaelid !== undefined) {
				// special case for strings : the event receiver is a tspan, not a text
				raphaelid = element.parentNode.raphaelid;
			}

			if (raphaelid !== undefined) {
				return this.paper.getById(raphaelid);
			}
		}
	});

	var Workspace = Backbone.Router.extend({
		formView: null,

		initialize: function(){
			this.formView = new FormView();
		}
	});

	$(function(){
		var app = new Workspace();
		Backbone.history.start();
	});
})(jQuery);