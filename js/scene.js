jQuery(function($) {


  var ft;
  var paper = Raphael(document.getElementById('canvas_container'), 630, 444);
  var selected;
  var elements = paper.set();
  var background = paper.rect(0,0,630,444).attr({fill: 'url("img/texture.png")'});
  var photo = paper.image("img/cute-baby.jpg", 10, 10, 350, 350);
  var font = 'impact';
  var fillColor = '#666';
  var strokeColor = '#000';

//  paper.registerSvgFont('impact', '../fonts/IMPACT.TTF');
  // var text = paper.text(490, 150, 'C\'EST\nENCORE\nUN\nGARCON' ).attr({fill: '#000','font-family' : 'TimesNewRoman', 'font-size': '55px', 'text-shadow' : '2px 2px #ff0000'});
  elements.push(photo);
  // elements.push(text);
  elements.push(paper.text(490, 50, 'C\'EST' ).attr({fill: fillColor, stroke: strokeColor,'font-family' : font, 'font-size': '55px'}).scale(2, 1));
  elements.push(paper.text(490, 125, 'ENCORE' ).attr({fill: fillColor, stroke: strokeColor,'font-family' : font, 'font-size': '55px'}).scale(1.4, 1));
  elements.push(paper.text(490, 200, 'UN GAR\u00C7ON' ).attr({fill: fillColor, stroke: strokeColor,'font-family' : font, 'font-size': '55px'}).scale(0.95, 1));
  elements.push(paper.text(490, 400, 'REMY').attr({fill: fillColor, stroke: strokeColor,'font-family' : font, 'font-size': '55px'}).scale(1.75, 1));
  elements.push(paper.text(180, 400, 'N\u00E9 le 26 avril 2013, 15kg, 55cm').attr({fill: '#000', 'font-family' : font, 'font-size': '25px'}));
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