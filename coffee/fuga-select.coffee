root = this
$ = jQuery

class FugaSelectBase

  _create: ->
    @element.hide()
    @_createElements()
    @_setupBindings()

  destroy: ->
    @_removeBindings()
    @_removeElements()
    @element.show()

  _createElements: ->
    @menu_el.remove() if @menu_el
    @menu_el = $('<ul></ul>').addClass('cllctr-options').insertAfter @element
    @_renderMenuContent()

  _removeElements: ->
    @menu_el.remove() if @menu_el
    @menu_el = null

  _setupBindings: ->
    @element.bind 'change', $.proxy @_handleChange, this
    if @menu_el
      @menu_el.click $.proxy(@_handleMenuClick, this)

  _removeBindings: ->
    @element.unbind 'change'

  _handleChange: (event) -> @_setValue @element.val()

  _handleMenuClick: (event) ->
    if $(event.target).is('li')
      event.preventDefault()
      value = $(event.target).attr('data-cllctr-value')
      if @_trigger 'select', event, value
        @_setValue value

  _getValue: ->
    return ''+@_value if @_value
    return ''+@_value = @element.val() if @element.is('select') || @element.is('input') 

  _setValue: (value) ->
    if @_trigger 'change', value
      @element.val(value) if @element.is('select') || @element.is('input') 
      return @_value = value

  _options: -> @_options_chache ||= $.map(@_optionsFromOptions() || @_optionsFromSelect() || [], @_normalizeOption)

  # todo; this should do more; like create value attribute, when there's only a label attribute, or turn strings into value/label objects
  _normalizeOption: (option) ->
    return {value: option, label: option} if typeof(option) == 'string'
    option.value = (''+option.value)
    return option

  _optionsFromOptions: -> @options.options

  _optionsFromSelect: ->
    return null if !@element.is('select')
    $.map @element.find('option'), (option) ->
      value: $(option).attr('value')
      label: $(option).text()

  _renderMenuContent: ->
    for option in @_options()
      @menu().append @_generateMenuOption(option)

  _generateMenuOption: (option) -> $('<li></li>').attr('data-cllctr-value', option.value).append $('<span />').text(option.label)

  value: (new_value) ->
    return @_setValue(new_value) if new_value
    @_getValue()

  menu: -> @menu_el





class FugaSelectDisplay extends FugaSelectBase

  _createElements: ->
    super()
    @_createDisplay()

  _removeElements: ->
    @_removeDisplay()
    super()

  _createDisplay: ->
    @_removeDisplay()
    @display_el = $('<a></a>').
      attr('href', '#').
      attr('onclick', 'return false').
      addClass('cllctr-display').
      insertAfter(@element)
    
    # chaining this in the above line causes some unexpected behaviour...
    @display().append( $('<span></span>').text(@_displayText()) ).append $("<div><b></b></div>")

  _removeDisplay: ->
    @display().remove() if @display()
    @display_el = null

  _selectedOption: ->
    self = this
    result = {}
    $.each @_options(), (index, option) ->
      # convert option value attributes to strings
      result = option if option.value == self._getValue()
    return result

  _setValue: (new_value) ->
    super(new_value)
    @display().text @_displayText()

  _displayText: ->
    return @_selectedOption().label if @_selectedOption() && @_selectedOption().label  && @_selectedOption().label != ''
    return @options.placeholder || ''

  display: ->
    @display_el




class FugaSelectToggler extends FugaSelectDisplay
  _createElements: ->
    super()
    @_createContainer()

  _removeElements: ->
    @_removeContainer()
    super()

  _createContainer: ->
    # remove any existing container
    @_removeContainer()
    # create the container element and insert it after the original element
    container = $('<div />').addClass('cllctr-container').addClass('cllctr-collapsed').insertAfter(@element)
    # append the original control inside the container
    @element.appendTo container
    # append the display in the container
    container.append @display() if @display()
    # add the drawer
    container.append $('<div />').addClass('cllctr-drawer')
    # add the options menu to the drawer
    @drawer().append @menu() if @menu()

  _removeContainer: ->
    if @container()
      # move the original element, the display and menu neatly back outside of the container
      @element.insertBefore(@container())
      @display().insertBefore(@container()) if @display()
      @menu().insertBefore(@container()) if @menu()
      @drawer().remove() if @drawer()
      # now remove container
      @container().remove()

  _setupBindings: ->
    super()
    if @display()
      @display().bind 'click', $.proxy @_handleDisplayClick, this

  _removeBindings: ->
    @display().unbind 'click' if @display()
    super()

  _handleDisplayClick: ->
    @toggle()

  _handleMenuClick: (event) ->
    super(event)
    @close()

  container: -> @element.parent('.cllctr-container')

  drawer: -> @container().find('.cllctr-drawer') if @container()

  toggle: ->
    if @is_open()
      @close()
    else
      @open()

  is_open: () -> @container() && @container().hasClass('cllctr-open')

  open: ->
    if @_trigger 'open'
      @container().removeClass('cllctr-collapsed').addClass('cllctr-open')

  close: ->
    if @_trigger 'close'
      @container().removeClass('cllctr-open').addClass('cllctr-collapsed')


class FugaSelectRemover extends FugaSelectToggler
  options: $.extend({}, FugaSelectToggler.options, {allow_remove: false, remove_text: ""})

  _generateMenuOption: (option) ->
    return super(option) if @options.allow_remove != true
    return super(option).append($('<abbr />').addClass('cllctr-remove').text(@options.remove_text))

  _handleMenuClick: (event) ->
    if $(event.target).is('abbr.cllctr-remove')
      event.preventDefault()
      value = $(event.target).parent('li').attr('data-cllctr-value')
      @remove_option(value) if @_trigger 'remove', event, value
    else
      super(event)

  remove_option: (value) -> @menu().find('li[data-cllctr-value='+value+']').addClass('cllctr-removed')
  unremove_option: (value) -> @menu().find('li[data-cllctr-value='+value+']').removeClass('cllctr-removed')





class FugaSelect extends FugaSelectRemover
  _createElements: ->
    super()
    # search must be explicitly enabled
    if @options.allow_search == true
      searcher = $('<div />').addClass('cllctr-search').append $('<input>').attr('type', 'text').addClass('cllctr-searcher') 
      if @menu # add right before options menu if there's an options menu
        @menu().before searcher
      else # otherwise simply add to the end of the widget's container
        @container().append searcher

  _removeElements: ->
    @searcher().remove() if @searcher()
    super()

  _setupBindings: ->
    super()
    @searcher().bind('keyup', $.proxy(@_handleSearcherTyping, this)) if @searcher()

  _removeBindings: ->
    @searcher().unbind('keyup') if @searcher()
    super()

  searcher: ->
    @drawer().find('.cllctr-search input.cllctr-searcher') if @container()

  _handleSearcherTyping: (event) ->
    @search(@searcher().val()) if @_trigger 'search', event, @searcher().val()

  search: (value) ->
    # also put the value in the searcher field, in case this was an external call
    @searcher().val(value) if @searcher()

    # set the filtered attribute for each option (in-memory)
    @_determineFilteredStates(value)
    # set menu option classes according to the inmemory options' filtered states
    @_applySearch({search_value: value})

    # TODO go through all available options, set unbinding options to filtered and update menu item classes
    @container().addClass 'cllctr-filtered'

  _determineFilteredStates: (value) ->
    # apply filtered status to internal (in-memory) option-objects
    for option in @_options()
      if @_matchOption(option, value)
        # explicitly set to false, overwriting any previous state
        option.filtered = false
      else
        option.filtered = true 

  # applies search states to the menu's option items
  _applySearch: (params) ->
    # set dom classes according to filtered state of in memory option objects
    for option in @_options()
      li = @menu().find('li[data-cllctr-value='+option.value+']')
      # put <em> tags around the matched part of the text
      li.find('span').html li.find('span').text().replace(params.search_value, "<em>"+params.search_value+"</em>") if params && params.search_value
      # add a filtered class to filtered options
      if option.filtered == true
        li.addClass('cllctr-filtered')
      else
        li.removeClass('cllctr-filtered')


  _matchOption: (option, value) -> option.label.indexOf(''+value) != -1

  unfilter: ->
    # TODO; remove filter classes form the individual items?
    @container().removeClass 'cllctr-filtered'


# register jquery widget from CautiousWidget class
$.widget 'fuga.collector', new FugaSelect
