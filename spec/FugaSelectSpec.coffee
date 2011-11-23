root = this
$ = jQuery

describe "Collector (Base)", ->

  beforeEach ->
    @html = '<select><option value="1">first</option><option value="2">second</option></select>'
    @widget = $(@html).appendTo($('body')).collector()

  afterEach ->
    @widget.collector 'destroy'
    @widget.remove()

  it "should generate an options list", ->
    expect(@widget.collector('menu').find('li').length).toEqual 2

  it "should provide a value getter", ->
    expect(@widget.collector('value')).toEqual '1'

  it "should change value when an option is clicked", ->
    @widget.collector('menu').find('li:eq(1) a:first').click()
    expect(@widget.collector('value')).toEqual '2'

  it "should allow changing value through the value setter, but only available values are allowed", ->
    @widget.collector('value', '1')
    expect(@widget.collector('value')).toEqual '1'
    # options "third" doesn't exist
    @widget.collector('value', '1')
    expect(@widget.collector('value')).toEqual '1'
  
  it "should trigger change event when value changes through value setter", ->
    spyOnEvent(@widget, 'collectorchange')
    @widget.collector('value', 'second')
    expect('collectorchange').toHaveBeenTriggeredOn(@widget)
  
  it "should trigger change event when an options is clicked changes through value setter", ->
    spyOnEvent(@widget, 'collectorchange')
    @widget.collector('menu').find('li a:first-child')[1].click()
    expect('collectorchange').toHaveBeenTriggeredOn(@widget)
  
  it "should hide the original dom-element", ->
    expect(@widget).not.toBeVisible()
  
  it "should remove the option list on cleanup", ->
    @widget.collector('destroy')
    expect(@widget.collector('menu')).not.toExist()
    expect(@widget).toBeVisible()

  it "should provide an option to specify the available choices", ->
    widget = $('<div />').appendTo($('body')).collector {options: [{value: 1, label: 'no 1'}, {value: 2, label: 'no 2'}, {value: 3, label: 'no 3'}]}
    @after ->
      widget.collector('destroy')
      widget.remove()
    expect($.map(widget.collector('menu').find('li a:first-child'), (a) -> $(a).text())).toEqual ['no 1', 'no 2', 'no 3']


describe "Collector (Display)", ->

  beforeEach ->
    @html = '<select><option value="1">first</option><option value="2">second</option></select>'
    @widget = $(@html).appendTo($('body')).collector()

  afterEach ->
    @widget.collector('destroy')
    @widget.remove()

  it "should render a value displayer", ->
    expect(@widget.collector('display')).toBeVisible()

  it "should remove the value displayer at destroy", ->
    @widget.collector('destroy')
    expect(@widget.collector('display')).not.toExist()

  it "should update the display when the value changes", ->
    @widget.collector('value', '2')
    expect(@widget.collector('display').text()).toEqual 'second'
    @widget.collector('menu').find('li:first a:first').click()
    expect(@widget.collector('display').text()).toEqual 'first'

  it "should show a placeholder text", ->
    widget2 = $('<select><option></option><option value="1">first</option><option value="2">second</option></select>').appendTo('body').collector({placeholder: 'Make a choice!'})
    expect(widget2.collector('display').text()).toEqual 'Make a choice!'
    widget2.collector 'destroy'
    widget2.remove()


describe "Collector (Toggling)", ->

  beforeEach ->
    @html = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>'
    @widget = $(@html).appendTo($('body')).collector()

  afterEach ->
    @widget.collector('destroy')
    @widget.remove()

  it "should render the displayer and options menu withing a wrapper", ->
    expect(@widget.collector('container')).toExist()
    expect(@widget.collector('container')).toContain 'select'
    expect(@widget.collector('container')).toContain 'a.collector-display'
    expect(@widget.collector('container')).toContain 'ul.collector-options'

  it "should hide the options menu by default", ->
    expect(@widget.collector('container')).toHaveClass 'collector-closed'

  it "should toggle the options menu when clicking on the display", ->
    @widget.collector('display').click()
    expect(@widget.collector('container')).toHaveClass 'collector-open'
    expect(@widget.collector('container')).not.toHaveClass 'collector-closed'
    @widget.collector('display').click()
    expect(@widget.collector('container')).toHaveClass 'collector-closed'
    expect(@widget.collector('container')).not.toHaveClass 'collector-open'

  it "should provide open and close methods", ->
    @widget.collector('open')
    expect(@widget.collector('container')).toHaveClass 'collector-open'
    @widget.collector('close')
    expect(@widget.collector('container')).toHaveClass 'collector-closed'

  it "should trigger open events", ->
    @widget.collector('open')
    expect(@widget.collector('container')).toHaveClass 'collector-open'
    
  it "should trigger an open event when the menu opens through the method", ->
    spyOnEvent(@widget, 'collectoropen')
    @widget.collector('open')
    expect('collectoropen').toHaveBeenTriggeredOn(@widget)

  it "should trigger an open event when the menu opens by a click", ->
    spyOnEvent(@widget, 'collectoropen')
    @widget.collector('display').click()
    expect('collectoropen').toHaveBeenTriggeredOn(@widget)

  it "should trigger a close event when the menu closes through the method", ->
    spyOnEvent(@widget, 'collectorclose')
    @widget.collector('close')
    expect('collectorclose').toHaveBeenTriggeredOn(@widget)

  it "should trigger a close event when the menu closes by a click", ->
    spyOnEvent(@widget, 'collectorclose')
    @widget.collector('display').click() # open
    @widget.collector('display').click() # close
    expect('collectorclose').toHaveBeenTriggeredOn(@widget)

  it "should cleanup nicely put the original element back and remove the container", ->
    @widget.collector 'destroy'
    expect(@widget.collector('container')).not.toExist()
    expect(@widget).toBeVisible()




describe "Collector (Removing)", ->

  beforeEach ->
    @html = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>'
    @widget = $(@html).appendTo($('body')).collector
      allow_remove: true
      remove_text: 'Get rid of this!'

  afterEach ->
    @widget.collector('destroy')
    @widget.remove()

  it "should add delete links to each menu item", ->
    expect(@widget.collector('menu').find('li a.collector-remove').length).toEqual 3

  it "should provide a remove_text option that specifies remove link content", ->
    expect(@widget.collector('menu').find('li:first a.collector-remove').text()).toEqual 'Get rid of this!'

  it "should trigger a remove event when a remove link is clicked", ->
    spyOnEvent(@widget, 'collectorremove')
    @widget.collector('menu').find('li:first a.collector-remove').click()
    expect('collectorremove').toHaveBeenTriggeredOn(@widget)

  it "should add the collector-removed class to removed items", ->
    li = @widget.collector('menu').find('li:eq(1)')
    expect(li).not.toHaveClass 'collector-removed'
    li.find('a.collector-remove').click()
    expect(li).toHaveClass 'collector-removed'

  it "should provide easy value-based interface to manually remove options", ->
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'collector-removed'
    @widget.collector 'remove_option', '3'
    expect(@widget.collector('menu').find('li:last')).toHaveClass 'collector-removed'

  it "should provide easy value-based interface to unremove options", ->
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'collector-removed'
    @widget.collector 'remove_option', '3'
    expect(@widget.collector('menu').find('li:last')).toHaveClass 'collector-removed'
    @widget.collector 'unremove_option', '3'
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'collector-removed'

  it "shouldn't add the remove links by default", ->
    html2 = '<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>'
    widget2 = $(html2).appendTo($('body')).collector()

    @after ->
      widget2.collector('destroy')
      widget2.remove()

    expect(widget2.collector('menu').find('li a.collector-remove')).not.toExist()