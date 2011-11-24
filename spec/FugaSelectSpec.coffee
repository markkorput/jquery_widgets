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
    @widget.collector('menu').find('li:eq(1)').click()
    expect(@widget.collector('value')).toEqual '2'

  # it "should allow changing value through the value setter, but only available values are allowed", ->
  #   @widget.collector('value', '1')
  #   expect(@widget.collector('value')).toEqual '1'
  #   # options "third" doesn't exist
  #   @widget.collector('value', '3')
  #   expect(@widget.collector('value')).toEqual '1'

  it "should distribute new value to the original element", ->
    @widget.collector 'value', 2
    expect(@widget.val()).toEqual '2'

  it "should trigger change event when value changes through value setter", ->
    spyOnEvent(@widget, 'collectorchange')
    @widget.collector('value', 'second')
    expect('collectorchange').toHaveBeenTriggeredOn(@widget)

  it "should trigger change event when an options is clicked changes through value setter", ->
    spyOnEvent(@widget, 'collectorchange')
    @widget.collector('menu').find('li:eq(1)').click()
    expect('collectorchange').toHaveBeenTriggeredOn(@widget)

  it "should hide the original dom-element", ->
    expect(@widget).not.toBeVisible()

  it "should remove the option list on cleanup", ->
    @widget.collector('destroy')
    expect(@widget.collector('menu')).not.toExist()
    expect(@widget).toBeVisible()

  it "should provide an option to specify the available choices", ->
    widget = $('<div />').appendTo($('body')).collector {options: [{value: 1, label: 'no 1'}, {value: 2, label: 'no 2'}, {value: 3, label: 'no 3'}]}
    @after -> widget.collector('destroy'); widget.remove()
    expect($.map(widget.collector('menu').find('li'), (a) -> $(a).text())).toEqual ['no 1', 'no 2', 'no 3']


describe "Collector (Display)", ->

  beforeEach ->
    @html = '<select><option value="1">first</option><option value="2">second</option></select>'
    @widget = $(@html).appendTo($('body')).collector()

  afterEach ->
    @widget.collector('destroy')
    @widget.remove()

  it "should render a value displayer", ->
    expect(@widget.collector('display')).toExist()

  it "should remove the value displayer at destroy", ->
    @widget.collector('destroy')
    expect(@widget.collector('display')).not.toExist()

  it "should update the display when the value changes", ->
    @widget.collector('value', '2')
    expect(@widget.collector('display').text()).toEqual 'second'
    @widget.collector('menu').find('li:first').click()
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
    expect(@widget.collector('container')).toContain 'a.cllctr-display'
    expect(@widget.collector('container')).toContain 'ul.cllctr-options'

  it "should hide the options menu by default", ->
    expect(@widget.collector('container')).toHaveClass 'cllctr-collapsed'

  it "should toggle the options menu when clicking on the display", ->
    @widget.collector('display').click()
    expect(@widget.collector('container')).toHaveClass 'cllctr-open'
    expect(@widget.collector('container')).not.toHaveClass 'cllctr-collapsed'
    @widget.collector('display').click()
    expect(@widget.collector('container')).toHaveClass 'cllctr-collapsed'
    expect(@widget.collector('container')).not.toHaveClass 'cllctr-open'

  it "should provide open and close methods", ->
    @widget.collector('open')
    expect(@widget.collector('container')).toHaveClass 'cllctr-open'
    @widget.collector('close')
    expect(@widget.collector('container')).toHaveClass 'cllctr-collapsed'

  it "should trigger open events", ->
    @widget.collector('open')
    expect(@widget.collector('container')).toHaveClass 'cllctr-open'
    
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

  it "should close the options menu when an option is selected", ->
    @widget.collector('open')
    expect(@widget.collector('container')).toHaveClass 'cllctr-open'
    @widget.collector('menu').find('li:first').click()
    expect(@widget.collector('container')).toHaveClass 'cllctr-collapsed'

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
    expect(@widget.collector('menu').find('li abbr.cllctr-remove').length).toEqual 3

  it "should provide a remove_text option that specifies remove link content", ->
    expect(@widget.collector('menu').find('li:first abbr.cllctr-remove').text()).toEqual 'Get rid of this!'

  it "should trigger a remove event when a remove link is clicked", ->
    spyOnEvent(@widget, 'collectorremove')
    @widget.collector('menu').find('li:first abbr.cllctr-remove').click()
    expect('collectorremove').toHaveBeenTriggeredOn(@widget)

  it "should add the cllctr-removed class to removed items", ->
    li = @widget.collector('menu').find('li:eq(1)')
    expect(li).not.toHaveClass 'cllctr-removed'
    li.find('abbr.cllctr-remove').click()
    expect(li).toHaveClass 'cllctr-removed'

  it "should provide easy value-based interface to manually remove options", ->
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'cllctr-removed'
    @widget.collector 'remove_option', '3'
    expect(@widget.collector('menu').find('li:last')).toHaveClass 'cllctr-removed'

  it "should provide easy value-based interface to unremove options", ->
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'cllctr-removed'
    @widget.collector 'remove_option', '3'
    expect(@widget.collector('menu').find('li:last')).toHaveClass 'cllctr-removed'
    @widget.collector 'unremove_option', '3'
    expect(@widget.collector('menu').find('li:last')).not.toHaveClass 'cllctr-removed'

  it "shouldn't add the remove links by default", ->
    widget2 = $('<select><option value="1">first</option><option value="2">second</option><option value="3">third</option></select>').appendTo($('body')).collector()
    @after -> widget2.collector('destroy'); widget2.remove()
    expect(widget2.collector('menu').find('li abbr.cllctr-remove')).not.toExist()



describe "Collector (Searching)", ->

  beforeEach ->
    # @choices = [{value: 1, label: 'first'}, {value: 2, label: 'second'}, {value: 3, label: 'third'}, {value: 4, label: 'fourth'}, {value: 5, label: 'fifth'}]
    @choices = ['first', 'second', 'third', 'fourth', 'fifth']
    @widget = $('<div id="dummy">&nbsp;</div>').appendTo($('body')).collector
      options: @choices,
      allow_search: true

  afterEach ->
    @widget.collector('destroy')
    @widget.remove()

  it "should add a search field to the widget", ->
    expect(@widget.collector('searcher')).toExist()

  it "should add the searcher to the container", ->
    expect(@widget.collector('container')).toContain 'input.cllctr-searcher'

  it "should trigger a search event with the search value when there's typing in the search field", ->
    # this should receive the right value
    callback_value = null
    # setup binding
    @widget.bind 'collectorsearch', (event, value) -> callback_value = value
    # cleanup when test is done
    @after -> @widget.unbind 'collectorsearch'
    # simulate user search
    @widget.collector('searcher').val 'testSearch'
    @widget.collector('searcher').keyup()
    # check if our custom callback was triggered with the right value
    expect(callback_value).toEqual 'testSearch'

  it "should add the cllctr-filtered class to the widget container when searching for a value", ->
    expect(@widget.collector('container')).not.toHaveClass 'cllctr-filtered'
    @widget.collector('searcher').keyup()
    expect(@widget.collector('container')).toHaveClass 'cllctr-filtered'

  it "should provide a manual search method", ->
    expect(@widget.collector('container')).not.toHaveClass 'cllctr-filtered'
    @widget.collector('search', 'something')
    expect(@widget.collector('container')).toHaveClass 'cllctr-filtered'

  it "should provide an unfilter method", ->
    @widget.collector 'search', 'filter_text'
    expect(@widget.collector('container')).toHaveClass 'cllctr-filtered'
    @widget.collector 'unfilter'
    expect(@widget.collector('container')).not.toHaveClass 'cllctr-filtered'

  it "should add a cllctr-filtered class to menu options who's label that don't match the search value", ->
    expect(@widget.collector('menu').find('li:eq(0)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(1)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(2)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(3)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(4)')).not.toHaveClass 'cllctr-filtered'
    @widget.collector 'search', 'th'
    expect(@widget.collector('menu').find('li:eq(0)')).toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(1)')).toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(2)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(3)')).not.toHaveClass 'cllctr-filtered'
    expect(@widget.collector('menu').find('li:eq(4)')).not.toHaveClass 'cllctr-filtered'

  it "should not render the search field by default", ->
    widget2 = $('<div id="dummy">&nbsp</div>').appendTo($('body')).collector {options: [{value: 1, label: 'one'}, {value: 2, label: 'two'}]}
    @after -> widget2.collector('destroy'); widget2.remove();
    expect(widget2.collector('searcher')).not.toExist()

  it "should emphasize matched text in option labels", ->
    @widget.collector('search', 'our')
    expect(@widget.collector('menu').find('li:eq(3)').html()).toContain 'f<em>our</em>th'


describe "Collector (Creator)", ->

  beforeEach ->
    @widget = $('<div id="dummy">&nbsp;</div>').appendTo($('body')).collector
      options: ['first', 'second', 'third', 'fourth', 'fifth']
      allow_create: true

  afterEach -> @widget.collector('destroy'); @widget.remove()

  it "should add creator option", ->
    expect(@widget.collector('creator')).toHaveClass('.cllctr-creator')

  it "should add the cllctr-perfect-match class to the container when a search value has a perfect match", ->
    @widget.collector('search', 'second')
    expect(@widget.collector('container')).toHaveClasse('cllctr-perfect-match')

  it "should add a new option when the creator option is clicked", ->
    @widget.collector('search', '6th')
    @widget.collector('creator').click()
    expect(@widget.collector('menu').find('li[data-cllctr-value=new1]').text()).toEqual('6th')

  it "should trigger a create event", ->
    callback_value = null
    @widget.bind 'collectorcreate', (event, value) -> callabck_value = value
    @after -> @widget.unbind 'collectorcreate'
    @widget.collector('search', 'Number Six')
    expect(callback_value).toEqual('Number Six')
