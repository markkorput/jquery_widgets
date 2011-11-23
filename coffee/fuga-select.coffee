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
    @menu_el = @_generateMenu().insertAfter @element

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
    if $(event.target).is('a')
      event.preventDefault()
      value = $(event.target).parent('li').attr('value')
      if @_trigger 'select', event, value
        @_setValue value

  _getValue: ->
    return ''+@_value if @_value
    return ''+@_value = @element.val() if @element.is('select') || @element.is('input') 

  _setValue: (value) ->
    if @_trigger 'change', value
      @element.val(value) if @element.is('select') || @element.is('input') 
      return @_value = value

  _availableOptions: -> @_availableOptionsCache ||= $.map(@_optionsFromOptions() || @_optionsFromSelect() || [], @_normalizeOption)

  # todo; this should do more; like create value attribute, when there's only a label attribute, or turn strings into value/label objects
  _normalizeOption: (option) ->
    option.value = (''+option.value)
    return option

  _optionsFromOptions: -> @options.options

  _optionsFromSelect: ->
    return null if !@element.is('select')
    $.map @element.find('option'), (option) ->
      value: $(option).attr('value')
      label: $(option).text()

  _generateMenu: (options) ->
    options ||= @_availableOptions()
    menu = $('<ul></ul>').addClass('collector-options')
    self = this
    $.each options, (index, option) -> self._generateMenuOption(option).appendTo(menu)
    return menu

  _generateMenuOption: (option) ->
    $('<li></li>').attr('value', option.value).append($('<a></a>').text(option.label))
    

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
    @display_el = $('<a></a>').attr('href', '#').attr('onclick', 'return false').addClass('collector-display').insertAfter(@element) #.html(@_displayText())
    # chaining this in the above line causes some unexpected behaviour...
    @display().text @_displayText()

  _removeDisplay: ->
    @display().remove() if @display()
    @display_el = null

  _selectedOption: ->
    self = this
    result = {}
    $.each @_availableOptions(), (index, option) ->
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
    @container_el = $('<div />').addClass('collector-container').addClass('collector-closed').insertAfter(@element)

    # append the original control and the display and menu elements created by parent classes inside the container
    @element.appendTo(@container())
    @display().appendTo(@container()) if @display()
    @menu().appendTo(@container()) if @menu()

  _removeContainer: ->
    if @container()
      # move the original element, the display and menu neatly back outside of the container
      @element.insertBefore(@container())
      @display().insertBefore(@container()) if @display()
      @menu().insertBefore(@container()) if @menu()

      # now remove container
      @container().remove()
    @container_el = null

  _setupBindings: ->
    super()
    if @display()
      @display().bind 'click', $.proxy @_handleDisplayClick, this

  _removeBindings: ->
    @display().unbind 'click' if @display()
    super()

  _handleDisplayClick: ->
    @toggle()

  container: -> @container_el

  toggle: ->
    if @is_open()
      @close()
    else
      @open()

  is_open: () -> @container() && @container().hasClass('collector-open')

  open: ->
    if @_trigger 'open'
      @container().removeClass('collector-closed').addClass('collector-open')

  close: ->
    if @_trigger 'close'
      @container().removeClass('collector-open').addClass('collector-closed')


class FugaSelect extends FugaSelectToggler
  options: $.extend({}, FugaSelectToggler.options, {allow_remove: false, remove_text: "remove"})

  _generateMenuOption: (option) ->
    return super(option) if @options.allow_remove != true
    return super(option).append($('<a></a>').attr('href', '#').addClass('collector-remove').text(@options.remove_text))

  _handleMenuClick: (event) ->
    if $(event.target).is('a.collector-remove')
      event.preventDefault()
      value = $(event.target).parent('li').attr('value')
      @remove_option(value) if @_trigger 'remove', event, value
    else
      super(event)

  remove_option: (value) -> @menu().find('li[value='+value+']').addClass('collector-removed')
  unremove_option: (value) -> @menu().find('li[value='+value+']').removeClass('collector-removed')


# register jquery widget from CautiousWidget class
$.widget 'fuga.collector', new FugaSelect
