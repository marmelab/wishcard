jQuery(function($) {


  var ft;
  var paper = Raphael(document.getElementById('canvas_container'), 630, 444);
  var selected;
  var elements = paper.set();
  var background = paper.rect(0,0,630,444).attr({fill: 'url("img/texture.png")'});
  var photo = paper.image("img/cute-baby.jpg", 10, 10, 350, 350);
  var font = 'Lobster Two';
  var fillColor = '#666';
  var strokeColor = '#000';  
  elements.push(photo);
  elements.push(paper.circle(430, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
  elements.push(paper.circle(490, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
  elements.push(paper.circle(550, 50, 15).attr({ 'stroke-width': 0, fill: '#EDC387'}));
  elements.push(paper.text(490, 50, 'C\'EST' ).attr({fill: fillColor, 'font-family' : font, 'font-size': '55px'}).transform('m1.516,0,0,1,-253.8498,71'));
  elements.push(paper.text(490, 125, 'ENCORE' ).attr({fill: fillColor, 'font-family' : font, 'font-size': '55px'}).transform('m0.9909,0,0,0.5116,-0.5354,92.0501'));
  elements.push(paper.text(490, 200, 'UN GAR\u00C7ON' ).attr({fill: fillColor, 'font-family' : font, 'font-size': '55px'}).transform('m0.6206,0,0,0.6709,183.8925,53.8888'));
  elements.push(paper.text(320, 400, 'R\u00E9mi est n\u00E9 le 26 avril 2013 \u00E0 2h37. 15kg, 55cm').attr({fill: '#000', 'font-family' : font, 'font-size': '25px'}));
  elements.forEach(function(element){
    element.node.classList.add('movable');
  });
  // not movable
  elements.push(paper.text(490, 300, '~').attr({fill: fillColor, stroke: strokeColor,'font-family' : font, 'font-size': '100px'}));



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
      stroke: '#00f',
      'stroke-dasharray': "-.",
      'stroke-width': '0.02em'
    });
    e.stopPropagation();
  };

  var blurSelectableElement = function(e) {
    var rafel = e.matrix ? e : getRaphaelElement(e.target);
    rafel.attr(rafel.data('savedAttributes'));
  };

  var unselectAll = function(e) {
    if (!e.target.classList.contains('movable') && ft) {
      $(selected.node).trigger('unselect');
    }
  };

  var enableSelection = function() {
    $('#canvas_container svg').on('click', '.movable, .movable tspan', selectElement);
    $('#canvas_container svg').on('mouseover', '.movable', revealSelectableElement);
    $('#canvas_container svg').on('mouseout', '.movable', blurSelectableElement);
    $('#canvas_container svg').on('unselect', '.movable', unselectElement);
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

  window.onUnload = function(){
   paper.clear();
  };
});