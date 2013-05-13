define([
	'jquery',
	'underscore',
	'backbone',
	'raphael',
	'raphael-freeTransform',
	'raphael-inline_text_editing',
	'collections/Shapes',
	'models/Shape'
], function($, _, Backbone, Raphael, RaphaelFt, RaphaelTextEdit, Shapes, Shape){
	var ShapesView = Backbone.View.extend({
		el          : $('#editor'),
		paper       : null,
		shapes      : null,
		elements    : null,
		ft          : null,
		textEditing : null,
		selected    : null,
		font        : 'Lobster Two',
		mouse       : {x: 0, y:0},

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
			'click #canvas_container'                     : 'unselectAll',
			'click #move_foreground'                      : 'moveToForeground',
			'click #move_background'                      : 'moveToBackground'
		},

		initialize: function(){
			// Initialize Raphael paper
			this.paper = Raphael(document.getElementById('canvas_container'), 630, 444);

			// Group each Raphael elements in a set
			this.elements = this.paper.set();

			var self = this;

			// Retrieve shapes
			this.shapes = new Shapes();

			// Parse saved shapes
			var fetchedShapes = this.shapes.fetch();
			fetchedShapes.done(function () {
				_.each(self.shapes.models, function (shape) {

					// Draw stored shape
					self.drawShape(shape.attributes);
				});
			});

			// Add default elements
			if(this.shapes.models.length == 0){
				this.addDefaultElements();
			}

			// Store mouse coordinates
			$(document).mousemove(function(e) {
				self.mouse.x = e.pageX - $('#canvas_container').position().left;
				self.mouse.y = e.pageY - $('#canvas_container').position().top;
			})
		},

		addDefaultElements : function(){
			var self = this;

			// Add defaults elements
			var background = this.paper.rect(0,0,630,444).attr({fill: 'url("img/texture.png")'});
			var photo = this.paper.image("img/cute-baby.jpg", 10, 10, 350, 350);
			var fillColor = '#666';
			var strokeColor = '#000';
			this.elements.push(photo);
			this.elements.push(this.paper.circle(430, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
			this.elements.push(this.paper.circle(490, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
			this.elements.push(this.paper.circle(550, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
			this.elements.push(this.paper.text(490, 120, 'C\'EST' ).attr({fill: fillColor, 'font-family' : this.font, 'font-size': '55px'}).scale(1.5, 0.8));
			this.elements.push(this.paper.text(490, 180, 'ENCORE' ).attr({fill: fillColor, 'font-family' : this.font, 'font-size': '55px'}).scale(1, 1.5));
			this.elements.push(this.paper.text(490, 235, 'UN GAR\u00C7ON' ).attr({fill: fillColor, 'font-family' : this.font, 'font-size': '55px'}).scale(0.65, 1));
			this.elements.push(this.paper.text(320, 400, 'R\u00E9mi est n\u00E9 le 26 avril 2013 \u00E0 2h37. 15kg, 55cm').attr({fill: '#000', 'font-family' : this.font, 'font-size': '25px'}));
			this.elements.forEach(function(element){
				element.node.setAttribute('class', 'movable');
			});
			// not movable
			this.elements.push(this.paper.text(490, 320, '~').attr({fill: fillColor, stroke: strokeColor,'font-family' : this.font, 'font-size': '100px'}));

			// Add background first
			var currentElement  = 0;
			var elementsToStore = Array.prototype.slice.call(this.elements);
			elementsToStore.unshift(background);
			var nbElements      = elementsToStore.length;

			// Store all elements
			(function saveDefaults(){
				if(currentElement == nbElements){
					return;
				}

				var element = elementsToStore[currentElement];

				// Get translations
				var translateX = 0;
				var translateY = 0;
				for(var i = 0, length = element._.transform.length; i < length; i++){
					var matrixComponents = element._.transform[i];
					var transform = matrixComponents[0].toLowerCase();

					if(transform == 't'){
						translateX += matrixComponents[1];
						translateY += matrixComponents[2];
					}
				}

				// Store element transformations
				element.transform   = {
					rotate    : element._.deg,
					scale     : {x: element._.sx, y: element._.sy},
					translate : {x: translateX, y: translateY}
				};

				// Save the default element
				self.shapes.addRaphaelElement(element, function(err, element){
					if(err){
						return console.err(err);
					}

					currentElement++;
					saveDefaults();
				});
			})();
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
			if(model.classList){
				for(var i = 0, len = model.classList.length; i < len; i++){
					raphaelElement.node.classList.add(model.classList[i]);
				}
			}

			// Store models id
			$(raphaelElement.node).attr('data-id', model.id);

			// Apply transformation
			if(model.transform != null){
				var ft = this.paper.freeTransform(raphaelElement);

				ft.attrs.rotate     = model.transform.rotate || 0;
				ft.attrs.scale      = model.transform.scale|| {x: 1, y:1};
				ft.attrs.translate  = model.transform.translate || {x: 0, y: 0};

				ft.apply();
				ft.unplug();
			}
		},

		addRect: function(){
			var element = this.paper.rect(250, 250, 100, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			this.saveShape(element);
		},

		addCircle: function(){
			var element = this.paper.circle(250, 250, 100).attr({ fill: '#EDC387'});
			element.node.classList.add('movable');

			this.saveShape(element);
		},

		addText : function(){
			var element = this.paper.text(250, 250, 'Some text ...').attr({ fill: '#EDC387'});
			element.attr({fill: '#000', 'font-family' : this.font, 'font-size': '25px'});
			element.attr({'text-anchor': 'start'});

			element.node.classList.add('movable');

			this.saveShape(element);
		},

		saveShape: function(element){
			var self = this;

			this.shapes.addRaphaelElement(element, function(err, model){
				if(err){
					return console.log(err);
				}

				self.drawShape(model.attributes);
				element.remove();
			});
		},

		moveToForeground : function(){
			if (this.selected == null) {
				return;
			}

			this.shapes.changeShapesOrder($(this.selected.node).attr('data-id'), true);

			this.selected.toFront();
			this.saveCurrentShape();
		},

		moveToBackground : function(){
			if (this.selected == null) {
				return;
			}

			this.shapes.changeShapesOrder($(this.selected.node).attr('data-id'), false);

			this.selected.toBack();
			this.saveCurrentShape();
		},

		editText: function(e){
			if (this.selected !== null) {
				$(this.selected.node).trigger('unselect');
			}

			var self = this;
			var element = this.getRaphaelElement(e.target);

			if(this.ft){
				this.ft.hideHandles();
			}

			var textEditing = this.paper.inlineTextEditing(element);
			var input = textEditing.startEditing();

			input.blur(function(){
				textEditing.stopEditing();

				self.saveCurrentShape();
				self.onShapeUnselected();
			})
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
			if(!this.selected){
				return;
			}

			var bbox = this.selected._getBBox();
			var x = this.selected.matrix.x(bbox.x, bbox.y);
			var y = this.selected.matrix.y(bbox.x, bbox.y);
			var width = this.selected.matrix.x(bbox.x + bbox.width, bbox.y +bbox.height) - x;
			var height = this.selected.matrix.y(bbox.x + bbox.width, bbox.y +bbox.height) - y;

			if(this.mouse.x > x && this.mouse.x < x + width
					&& this.mouse.y > y && this.mouse.y < y + height){
				return;
			}

			this.saveCurrentShape();
			this.onShapeUnselected();
		},

		saveCurrentShape: function(){
			if(this.selected == null){
				return;
			}
			var shapeId = $(this.selected.node).attr('data-id');

			// Update shape attributes
			var shape                   = this.shapes.get(shapeId);
			if(!shape){
				return;
			}

			shape.attributes.attributes = this.selected.attrs;
			shape.ordering              = this.selected.ordering;
			shape.attributes.transform  = {
				rotate    : this.ft.attrs.rotate,
				scale     : this.ft.attrs.scale,
				translate : this.ft.attrs.translate
			};

			shape.save();
		},

		onShapeUnselected : function(){
			if(this.selected == null){
				return;
			}

			this.ft.unplug();
			this.selected.node.classList.remove('selected');

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