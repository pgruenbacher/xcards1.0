angular.module('starter.services', ['http-auth-interceptor'])

/**
 * A simple example service that returns some data.
 */
.factory('FacebookService',function(Facebook){
  var user=null;
  return{
    me:function(){
      return Facebook.api('/me', function(response) {
      });
    }
  }
})
.factory('TransferService',function(Restangular,UserService){
  //transfers structure
  /*var transfers=[{
    user:null,
    credits:null,
    addresses:null
  }];*/
  var transfers=[];
  var transferAPI=Restangular.all('transferAPI');
  return {
    create:function(transfer){
      return transferAPI.post(transfer);
    },
    check:function(user){
      if(user.email){
        return UserService.find(user.email);
      }
    },
    saveUser:function(user,optionalId){
      optionalId=optionalId || false;
      if(optionalId){
        transfers[optionalId].user=user;
        return optionalId;
      }
      return transfers.push({user:user})-1; //need to return index not length
    },
    get:function(id){
      return transfers[id];
    }
  }
})
.factory('UserService',function($http,Restangular){
  var user;
  var userAPI=Restangular.all('userAPI');
  return{
    authenticate:function(){
      Restangular.all('user/auth').getList().then(function(response){
        console.log(response);

      },function(response){
        console.log(response);
      })
    },
    get:function(id){
      return userAPI.get(id);
    },
    find:function(email){
      return userAPI.get("find", {"filter": email, "where":"email"});
    },
    create: function(user){
      return userAPI.post(user);
    }
  }
})
.factory('Addresses', function($http,API,Restangular,CacheAndCall) {
  var addresses=[];
  var addressesAPI=Restangular.all('addressesAPI');
  // Might use a resource here that returns a JSON array
  return {
    all: function(callback){
      CacheAndCall.getCacheList(Restangular.all('addressesAPI'), {}, function (value) {
        addresses=value;
        callback(value);
      });
    },
    create:function(address){
     return addressesAPI.post(address);
    },
    get: function(addressId) {
      console.log(addressId, 'addressId',addresses);
      return addresses[addressId];
    },
    copy: function(addressId){
      console.log(addresses[addressId]);
      return Restangular.copy(addresses[addressId]);
    },
    put: function(address){
      return address.put();
    },
    delete: function(addressId){
      return $http.delete(API.domain+'/mobile/addressesAPI/'+addresses[addressId].id)
      .then(function(addressId){
        addresses.splice(addressId,1);
      });
    }
  }


})
.factory('AuthenticationService', function($rootScope, $http, authService, API, Restangular, $state, localStorageService) {
  var user=[];
  return service = {
    login: function(user) {
      var self=this;
      console.log('login');
      var token_request=Restangular.oneUrl('oauth/access_token');
      token_request.get({
        username:user.email,
        password:user.password,
        grant_type:'password',
        scope:'test_scope',
        client_id:'123456',
        client_secret:'123456'
      }).then(
      function(data,status,headers,config){
        console.log('login response',data);
        if(self.saveUser(user)){
          console.log('saved user, saved authentication token');
        }else{
          console.log('failed to save user');
        }
        localStorageService.set('access_token',data.access_token);
          // Step 1
        // Need to inform the http-auth-interceptor that
        // the user has logged in successfully.  To do this, we pass in a function that
        // will configure the request headers with the authorization token so
        // previously failed requests(aka with status == 401) will be resent with the
        // authorization token placed in the header
        authService.loginConfirmed(data, function(config) {  // Step 2 & 3
          config.headers.Authorization = data.access_token;
          return config;
        });
        $state.go('app.dash');
      },
      function(data){
        console.log('error',data);
        $rootScope.$broadcast('event:auth-login-failed', data.status);
      });
    },
    logout: function(user) {
      $http.post('https://logout', {}, { ignoreAuthModule: true })
      .finally(function(data) {
        delete $http.defaults.headers.common.Authorization;
        $rootScope.$broadcast('event:auth-logout-complete');
      });     
    },  
    loginCancelled: function() {
      authService.loginCancelled();
    },
    saveUser:function(user){
      var stored=localStorageService.set('user',user);
      if(stored){
        return true;
      }else{
        return false;
      }
    },
    getUser:function(){
      user=localStorageService.get('user');
      if(user){
        return user;
      }else{
        return false;
      }
    },
    getAccessToken:function(){
     return localStorageService.get('access_token');
    }

  };
})
.factory('ParamService',function(){
  /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
      return {
        param : function(obj) {
          var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
            
          for(name in obj) {
            value = obj[name];
              
            if(value instanceof Array) {
              for(i=0; i<value.length; ++i) {
                subValue = value[i];
                fullSubName = name + '[' + i + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += param(innerObj) + '&';
              }
            }
            else if(value instanceof Object) {
              for(subName in value) {
                subValue = value[subName];
                fullSubName = name + '[' + subName + ']';
                innerObj = {};
                innerObj[fullSubName] = subValue;
                query += param(innerObj) + '&';
              }
            }
            else if(value !== undefined && value !== null)
              query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
          }
            
          return query.length ? query.substr(0, query.length - 1) : query;
        }
      } 
})
.factory('CacheAndCall',function($q){
  return {
    getCache: function (type, restangularObj, options, cacheCallback) {
      var cache_key = restangularObj.getRestangularUrl() + JSON.stringify(options);

      if (type == "one") {
          var promise = restangularObj.get(options);
      }
      else {
          var promise = restangularObj.getList(options);
      }
      var deferred = $q.defer();
      promise.then(function(data) {
          localStorage.setItem(cache_key, JSON.stringify(data));
          cacheCallback(data);
          deferred.resolve(data);
      }, function(data) {
          deferred.reject(data);
      });

      var item = localStorage.getItem(cache_key);
      if (item) {
          cacheCallback(JSON.parse(item));
      }
      return deferred.promise;
    },

    getCacheOne: function(restangularObj, options, cacheCallback) {
      var self=this;
        return self.getCache("one", restangularObj, options, cacheCallback);
    },

    getCacheList: function(restangularObj, options, cacheCallback) {
      var self=this;
        return self.getCache("list", restangularObj, options, cacheCallback);
    }
  }
})
.factory('BusyService', ['$ionicLoading', function($ionicLoading) {
  return {
    show: function(content) {
      $ionicLoading.show({
        template: '<span class="ion-loading-c"></span> Loading...',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    },
    hide: function() {
      $ionicLoading.hide(); 
    }
  };
}])