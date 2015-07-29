(function() {
  'use strict';

  angular.module('app.components')
    .controller('MyProfileController', MyProfileController);

    MyProfileController.$inject = ['$scope', '$location', 'userData', 'kitsData', 'AuthUser', 'user', 'auth', 'utils', 'alert', 'COUNTRY_CODES', '$timeout', 'file', 'PROFILE_TOOLS'];
    function MyProfileController($scope, $location, userData, kitsData, AuthUser, user, auth, utils, alert, COUNTRY_CODES, $timeout, file, PROFILE_TOOLS) {
      var vm = this;

      vm.highlightIcon = highlightIcon;
      vm.unhighlightIcon = unhighlightIcon; 

      //PROFILE TAB
      vm.formUser = {
        'avatar': null
      };
      vm.getCountries = getCountries;

      vm.user = userData; 
      _.defaults(vm.formUser, vm.user);
      vm.searchText = vm.formUser.country; 


      //KITS TAB
      // var kits = kitsData;
      vm.kits = kitsData;
      vm.kitStatus = undefined;
      vm.filteredKits = [];

      vm.dropdownSelected = undefined;
      vm.dropdownOptions = [
        {text: 'SET UP', value: '1'},
        {text: 'EDIT', value: '2'}
      ];

      //TOOLS TAB
      vm.tools = PROFILE_TOOLS;
      vm.toolType = undefined;
      vm.filteredTools = [];

      vm.filterKits = filterKits;
      vm.filterTools = filterTools;
      vm.updateUser = updateUser;
      vm.removeUser = removeUser;
      vm.uploadAvatar = uploadAvatar;

      $scope.$on('loggedOut', function() {
        $location.path('/');
      });

      $timeout(function() {
        highlightIcon(0); 
        setSidebarMinHeight();
      }, 500);

      //////////////////

      function filterKits(status) {
        if(status === 'all') {
          status = undefined;
        } 
        vm.kitStatus = status;
      }

      function filterTools(type) {
        if(type === 'all') {
          type = undefined;
        } 
        vm.toolType = type;
      }

      function updateUser(userData) {
        if(userData.country) {
          _.each(COUNTRY_CODES, function(value, key) {
            if(value === userData.country) {
              /*jshint camelcase: false */
              userData.country_code = key; 
              return;
            }
          });          
        } 

        user.updateUser(userData)
          .then(function(data) {
            var user = new AuthUser(data);
            _.extend(vm.user, user);
            vm.errors = {};
            alert.success('User updated');
          })
          .catch(function(err) {
            alert.error('User could not be updated ');
            vm.errors = err.data.errors;
          });
      }

      function removeUser() {
        user.removeUser()
          .then(function() {
          });
      }

      function highlightIcon(iconIndex) {
        var icons = angular.element('.myProfile_tab_icon'); 

        _.each(icons, function(icon) {
          unhighlightIcon(icon);
        });

        var icon = icons[iconIndex];
        
        angular.element(icon).find('.stroke_container').css({'stroke': 'white', 'stroke-width': '0.01px'});
        angular.element(icon).find('.fill_container').css('fill', 'white');

      }

      function unhighlightIcon(icon) {
        icon = angular.element(icon);

        icon.find('.stroke_container').css({'stroke': 'none'});
        icon.find('.fill_container').css('fill', '#82A7B0');
      }

      function setSidebarMinHeight() {
        var height = document.body.clientHeight / 4 * 3;
        angular.element('.profile_content').css('min-height', height + 'px');
      }

      function getCountries(searchText) {
        return _.filter(COUNTRY_CODES, createFilter(searchText));
      }

      function createFilter(searchText) {
        searchText = searchText.toLowerCase();
        return function(country) {
          country = country.toLowerCase();
          return country.indexOf(searchText) !== -1; 
        };
      }

      function uploadAvatar(fileData) {
        if(fileData && fileData.length) {
          file.getCredentials(fileData[0].name)
            .then(function(res) {
            file.uploadFile(fileData[0], res.key, res.policy, res.signature)
                .progress(function() {
                })
                .success(function() {                  
                  vm.user.avatar = file.getImageURL(res.key);
                });
            });
        }
      }
    }
})();
