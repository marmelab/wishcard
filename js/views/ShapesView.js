define(['jquery','underscore', 'backbone', 'raphael', 'raphael-freeTransform','collections/Shapes'], function($, _, Backbone, Raphael, RaphaelFt, Shapes){
	var ShapesView = Backbone.View.extend({
		el          : $('#editor'),
		paper       : null,
		shapes      : null,
		elements    : null,
		ft          : null,
		selected    : null,
		willInsert  : false,
		font        : 'Lobster Two',

		events: {
			'click #insert_rect'                          : 'addRect',
			'click #insert_circle'                        : 'addCircle',
			'click #insert_text'                          : 'addText',
			'click #canvas_container svg .movable'        : 'selectElement',
			'dblclick #canvas_container svg text'         : 'editText',
			'click #canvas_container svg .movable tspan'  : 'selectElement',
			'mouseover #canvas_container svg .movable'    : 'revealSelectableElement',
			'mouseout #canvas_container svg .movable'     : 'blurSelectableElement',
			'unselect #canvas_container svg .movable'     : 'unselectElement',
			'click #canvas_container'                     : 'unselectAll'
		},

		initialize: function(){
			// Initialize Raphael paper
			this.paper = Raphael(document.getElementById('canvas_container'), 630, 444);

			// Group each Raphael elements in a set
			this.elements = this.paper.set();

			var self = this;

			// Retrieve shapes
			this.shapes = new Shapes();

			this.shapes.fetch({success: function(model, response){
				// Parse saved shapes
				_.each(response, function(model){

					self.drawShape(model);
				});
			}});

			this.listenTo(this.shapes,'sync', function(model){
				if(!self.willInsert){
					return;
				}

				self.drawShape(model.attributes);

				self.willInsert = false;
			});
		},

		drawShape: function(model){
			// Merge the type with the models attributes field
			var attributes = _.extend(model.attributes, {type : model.type});

			// Display the element on the paper
			var raphaelElements = this.paper.add([attributes]);
			var raphaelElement = raphaelElements[0];

			// Add the element to the current set
			this.elements.push(raphaelElement);

			// Add css classes
			for(var i = 0, len = model.classList.length; i < len; i++){
				raphaelElement.node.classList.add(model.classList[i]);
			}

			// Store models id
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



		addRect: function(){
			this.willInsert = true;

			var element = this.paper.rect(250, 250, 100, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			var rect = new Shape({attributes: element.attrs, type: element.type, classList: Array.prototype.slice.call(element.node.classList)});
			element.remove();

			this.shapes.add(rect);
			rect.save();
		},

		addCircle: function(){
			this.willInsert = true;

			var element = this.paper.circle(250, 250, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			var circle = new Shape({attributes: element.attrs, type: element.type, classList: Array.prototype.slice.call(element.node.classList)});
			element.remove();

			this.shapes.add(circle);
			circle.save();
		},

		addText : function(){
			this.willInsert = true;

			var element = this.paper.text(250, 250, 'Some text ...').attr({ fill: '#EDC387'});
			element.attr({fill: '#000', 'font-family' : this.font, 'font-size': '25px'});
			element.node.setAttribute("editable", "simple")

			element.node.classList.add('movable');

			var text = new Shape({attributes: element.attrs, type: element.type, classList: Array.prototype.slice.call(element.node.classList)});
			element.remove();

			this.shapes.add(text);
			text.save();
		},

		editText: function(e){
			if (this.selected !== null) {
				$(this.selected.node).trigger('unselect');
			}

			var element = this.getRaphaelElement(e.target);
			console.log(element.node);
		},

		selectElement : function(e) {
			if (this.selected !== null) {
				$(this.selected.node).trigger('unselect');
			}

			var element = this.getRaphaelElement(e.target);
			this.selected = element;

			element.node.classList.add('selected');
			this.ft = this.paper.freeTransform(element);

			this.blurSelectableElement(element);

			e.stopPropagation();
		},

		unselectElement : function(e) {
			this.ft.unplug();
			e.target.classList.remove('selected');

			var element = this.getRaphaelElement(e.target);
			var shapeId = $(element.node).attr('data-id');

			// Update shape attributes
			var f = this.shapes.get(shapeId);
			f.attributes.attributes = element.attrs;
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

			var element = this.getRaphaelElement(e.target);
			var currentAttrs = element.attr();

			element.data('savedAttributes', {
				stroke: currentAttrs.stroke,
				cursor: currentAttrs.cursor,
				'stroke-width': currentAttrs['stroke-width']
			});

			element.attr({
				stroke: '#00f',
				cursor: 'default',
				'stroke-width': '1px'
			});

			e.stopPropagation();
		},

		blurSelectableElement: function(e) {
			var element = e.matrix ? e : this.getRaphaelElement(e.target);
			element.attr(element.data('savedAttributes'));
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

	return ShapesView;
});