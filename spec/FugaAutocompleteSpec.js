describe('Fuga Autocomplete jQuery widget', function(){

  it("Should create a widget", function(){
    expect(typeof jQuery("<input type='text'>").autocomplete).toEqual('function');
  });

});