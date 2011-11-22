describe("Fuga Cautious Widget", function(){
  

  beforeEach(function(){
    this.delay = 20;
    this.widget = jQuery('<input type="text" id="the_cautious_one" />').appendTo(jQuery('body')).cautious(this.delay);
  });

  afterEach(function(){
    this.widget.cautious('destroy');
    this.widget.remove();
  });

  it("should trigger the start event when the user starts typing", function(){
    spyOnEvent(this.widget, 'cautiousstart');
    this.widget.keydown();
    expect('cautiousstart').toHaveBeenTriggeredOn(this.widget);
  });

  it("should trigger a stop event after <delay> ms", function(){
    var widget2 = jQuery('<input type="text" id="the_cautious_two" />').appendTo(jQuery('body')).cautious({delay: 100});

    this.after(function(){
       widget2.cautious('destroy');
       widget2.remove();
     });

    spyOnEvent(widget2, 'cautiousstop');
    widget2.trigger(jQuery.Event('keydown', {which: 67}));

    // wait until a little before the stop event should be triggered
    waits(80);
    runs(function(){ expect('cautiousstop').not.toHaveBeenTriggeredOn(widget2); });

    // wait until the stop event should have been tiggered
    waits(70);
    runs(function(){ expect('cautiousstop').toHaveBeenTriggeredOn(widget2); });
  });

});