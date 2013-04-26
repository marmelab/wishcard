jQuery(function($) {
  var ft;
  var paper = new Raphael(document.getElementById('canvas_container'), 500, 500);
  var selected;
  var elements = paper.set();
  var circle1 = paper.circle(250, 250, 60).attr({fill: '#000'});
  elements.push(circle1);
  elements.push(paper.text(350, 250, 'My\nMood').attr({fill: '#F00'}));
  elements.push(paper.circle(0, 250, 60).attr({fill: '#007'}));
  elements.forEach(function(element) {
    element.node.classList.add('editable');
  });
  // not editable
  elements.push(paper.text(250, 150, 'I\'m not editable').attr({fill: '#F00'}));

  var getRaphaelElement = function(element) {
    var raphaelId;
    if (element.raphaelid !== undefined) {
      raphaelid = element.raphaelid;
    } else if (element.parentNode.raphaelid !== undefined) {
      // special case for strings : the event receiver is a tspan, not a text
      raphaelid = element.parentNode.raphaelid;
    }
    if (raphaelid !== undefined) {
      return paper.getById(raphaelid);
    }
  };

  var selectElement = function(e) {
    if (selected !== undefined) {
      $(selected.node).trigger('unselect');
    } 
    var rafel = getRaphaelElement(this);
    selected = rafel;
    rafel.node.classList.add('selected');
    ft = paper.freeTransform(rafel);
    blurSelectableElement(rafel);
    e.stopPropagation();
  };

  var unselectElement = function(e) {
    ft.unplug();
    this.classList.remove('selected');
    selected = undefined;
  };

  var revealSelectableElement = function(e) {
    if (e.target.classList.contains('selected')) return;
    var rafel = getRaphaelElement(e.target);
    var currentAttrs = rafel.attr();
    rafel.data('savedAttributes', {
      stroke: currentAttrs.stroke,
      'stroke-dasharray': currentAttrs['stroke-dasharray'],
      'stroke-width': currentAttrs['stroke-width']
    });
    rafel.attr({
      stroke: '#ff0',
      'stroke-dasharray': "-.",
      'stroke-width': 3
    });
    e.stopPropagation();
  };

  var blurSelectableElement = function(e) {
    var rafel = e.matrix ? e : getRaphaelElement(e.target);
    rafel.attr(rafel.data('savedAttributes'));
  };

  var unselectAll = function(e) {
    if (!e.target.classList.contains('editable') && ft) {
      $(selected.node).trigger('unselect');
    }
  };

  var enableSelection = function() {
    $('#canvas_container svg').on('click', '.editable, .editable tspan', selectElement);
    $('#canvas_container svg').on('mouseover', '.editable', revealSelectableElement);
    $('#canvas_container svg').on('mouseout', '.editable', blurSelectableElement);
    $('#canvas_container svg').on('unselect', '.editable', unselectElement);
    $('#canvas_container svg').on('click', unselectAll);  
  };

  var disableSelection = function() {
    if (ft) ft.unplug();
    $('#canvas_container svg').unbind('click', selectElement);
    $('#canvas_container svg').unbind('mouseover', revealSelectableElement);
    $('#canvas_container svg').unbind('mouseout', blurSelectableElement);
    $('#canvas_container svg').unbind('unselect', unselectElement);
    $('#canvas_container svg').unbind('click', unselectAll);  
  };

  $('#arrow').click(enableSelection);
  $('#foo').click(disableSelection);
  enableSelection();
});