'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('starter.controllers','starter.services'));

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl1 = $controller('DashCtrl', { $scope: {} });
    expect(myCtrl1).toBeDefined();
  }));

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl1 = $controller('AccountCtrl', { $scope: {} });
    expect(myCtrl1).toBeDefined();
  }));

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl2 = $controller('FriendsCtrl', { $scope: {} });
    expect(myCtrl2).toBeDefined();
  }));
});
