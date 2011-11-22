root = this
$ = jQuery

class FugaWidget
  # options:
    # some_options: 'some_value'

  _create: -> @_setup_bindings()

  _destroy: -> @_remove_bindings()

  _setup_bindings: ->
    @element.bind 'change', $.proxy @_handleChange, this

  _remove_bindings: ->
    @element.unbind 'change'

  _handleChange: (event) -> @_setValue @element.val()

  _getValue: -> @element.val()

  _setValue: (value) ->
    if @_trigger 'change'
      @element.val value

  value: (new_value) ->
    return @_setValue(new_value) if new_value
    @_getValue()

# register jquery widget from CautiousWidget class
$.widget 'fuga.fugawidget', new FugaWidget
