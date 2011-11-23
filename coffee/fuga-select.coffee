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

  _getValue: -> @element.val()

  _setValue: (value) -> @element.val(value) if @_trigger 'change', value

  _availableOptions: -> @_availableOptionsCache ||= @_optionsFromOptions() || @_optionsFromSelect() || []

  # todo let this method parse the options and make sure we've got useable objects
  _optionsFromOptions: -> @options.options

  _optionsFromSelect: ->
    return null if !@element.is('select')
    $.map @element.find('option'), (option) ->
      value: $(option).attr('value')
      label: $(option).text()

  _generateMenu: (options) ->
    options ||= @_availableOptions()
    menu = $ '<ul></ul>'
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
  
  options: $.extend({}, FugaSelectBase.options, {placeholder: ""})

  _createElements: ->
    super()
    @_createDisplay()

  _removeElements: ->
    @_removeDisplay()
    super()

  _createDisplay: ->
    @display_el.remove() if @display_el
    @display_el = $('<a></a>').attr('href', '#').attr('onclick', 'return false').insertAfter(@element).text @_displayText()

  _removeDisplay: ->
    @display_el.remove() if @display_el
    @display_el = null

  _selectedOption: ->
    self = this
    result = {}
    $.each @_availableOptions(), (index, option) ->
      result = option if option.value == self._getValue()
    return result

  _setValue: (new_value) ->
    super(new_value)
    @display().text @_displayText()

  _displayText: ->
    return @_selectedOption().label if @_selectedOption() && @_selectedOption().label != ''
    @options.placeholder

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
    @_removeContainer() if @container_el
    @container_el = $('<div />').addClass('collector-container').addClass('collector-closed').insertAfter(@element)

    # append the display and menu element created by parent classes inside the container
    if @display()
      @display().appendTo @container_el
    
    if @menu()
      @menu().appendTo @container_el 

  _removeContainer: ->
    @container_el.remove() if @container_el
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
