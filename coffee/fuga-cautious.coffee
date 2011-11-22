root = this
$ = jQuery

# CautiousInput
CautiousWidget =
  options:
    delay: 900

  _create: -> @_setup_bindings()

  _destroy: ->
    @_remove_bindings()

  _setup_bindings: ->
    @element.bind 'keydown', $.proxy @_handleKeyDown, this

  _remove_bindings: ->
    @element.unbind 'keydown'

  _handleKeyDown: (event) ->
    # ready state is automatically reached when the user didn't type for a while
    if @_ready()
      # user started typing again; trigger event
      @_trigger 'start'

      # track the timestamp of last input
      @_lastInputTime = event.timeStamp

      # start a recursive check loop that keeps checking if the user is still typing,
      @_checkStillTyping()
    # not in ready state, meaning we're in 'reading user input' mode 
    else
      # simply track the timestamp of last input
      @_lastInputTime = event.timeStamp

  # time until we reach ready state, calculated using lastInputTime and the specified delay, or simply zero when typing didn't start
  _timeTillReady: ->
    if @_lastInputTime
      @_lastInputTime + @options.delay - (new Date).getTime()
    else
      0

  # tells us if we're in the ready state (user never started typing yet, or it's been a while since last typing)
  _ready: -> @_timeTillReady() <= 0

  # checks if the ready state was reached and trigger necessary events. Recursively calls itself with a delay to keep checking
  _checkStillTyping: ->
    # ready state reached?
    if @_ready()
      @_enterReadyState()
    else
      # this calls itself after a timeTillReady minus 5ms delay
      # window.setTimeout ((self) -> () -> $.proxy @_checkStillTyping, self)(this), @_timeTillReady()-5
      window.setTimeout $.proxy(@_checkStillTyping, this), @_timeTillReady()-5

  _enterReadyState: ->
    # means the user stopped typing long enough
    @_trigger 'stop'
    # only trigger newValue event the previous stopTyping event was on a different value
    if @element.val() == ''
      @_trigger 'empty'
      # special "nevermind" callback indicating typing didn't turn out to be useful
      @_trigger 'nevermind'
    else
      if @element.val() != @_previousValue
        # we got a new value
        @_trigger 'new', 0, @element.val()
      else
        # trigger the user stopped typing on the same value he had before he started typing
        @_trigger 'same', 0, @element.val()
        # special "nevermind" callback indicating typing didn't turn out to be useful
        @_trigger 'nevermind'

    # remember previous value so we can trigger the right event on the next run
    @_previousValue = @element.val();


CautiousWidget2 =
  _enterReadyState: ->
    @_trigger 'testt'
    super()
    
CautiousWidget2 extends CautiousWidget
  
# register jquery widget from CautiousWidget class
$.widget 'fuga.cautious', CautiousWidget2


# root = this
# $ = jQuery
# 
# # CautiousInput
# class CautiousWidget
#   options:
#     delay: 400
# 
#   _create: ->
#     this._setup_bindings()
# 
#   _destroy: ->
#     this._remove_bindings()
# 
#   _setup_bindings: ->
#     this.element.bind 'keydown', this._handleKeyDown
# 
#   _remove_bindings: ->
#     this.element.unbind 'keydown'
# 
#   _handleKeyDown: (event) =>
#     # ready state is automatically reached when the user didn't type for a while
#     if this._ready()
#       # user started typing again; trigger event
#       this._trigger 'start'
# 
#       # track the timestamp of last input
#       this._lastInputTime = event.timeStamp
# 
#       # start a recursive check loop that keeps checking if the user is still typing,
#       this._checkStillTyping
#     # not in ready state, meaning we're in 'reading user input' mode 
#     else
#       # simply track the timestamp of last input
#       this._lastInputTime = event.timeStamp
# 
#   # time until we reach ready state, calculated using lastInputTime and the specified delay, or simply zero when typing didn't start
#   _timeTillReady: -> $.isEmptyObject(this._lastInputTime) ? 0 : this._lastInputTime + this.options.delay - (new Date).getTime();
# 
#   # tells us if we're in the ready state (user never started typing yet, or it's been a while since last typing)
#   _ready: -> $.isEmptyObject(this._lastInputTime) || (this._timeTillReady() <= 0)
# 
#   # checks if the ready state was reached and trigger necessary events. Recursively calls itself with a delay to keep checking
#   _checkStillTyping: ->
#     # ready state reached?
#     if this._ready()
#       this._enterReadyState()
#     else
#       # this calls itself after a timeTillReady minus 5ms delay
#       window.setTimeout ((self) -> () -> self._checkStillTyping())(this), this._timeTillReady()-5
# 
#   _enterReadyState: ->
#     # means the user stopped typing long enough
#     this._trigger 'stop'
#     # only trigger newValue event the previous stopTyping event was on a different value
#     if this.element.val() == ''
#       this._trigger 'empty'
#       # special "nevermind" callback indicating typing didn't turn out to be useful
#       this._trigger 'nevermind'
#     else
#       if this.element.val() != this._previousValue
#         # we got a new value
#         this._trigger 'new', 0, this.element.val()
#       else
#         # trigger the user stopped typing on the same value he had before he started typing
#         this._trigger 'same', 0, this.element.val()
#         # special "nevermind" callback indicating typing didn't turn out to be useful
#         this._trigger 'nevermind'
# 
#     # remember previous value so we can trigger the right event on the next run
#     this._previousValue = this.element.val();
# 
# 
# # register jquery widget from CautiousWidget class
# $.widget 'fuga.cautious', new CautiousWidget