// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ngResource'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        //debugger;
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        /*if (TwitterService.isAuthenticated()) {
            $scope.showHomeTimeline();
        } else {
            TwitterService.initialize().then(function(result) {
                if (result === true) {
                    $scope.showHomeTimeline();
                }
            });
        }*/
    });

})

//run coredovaPush for push notification 



.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/tab-home.html',
            controller: 'DashCTR'
        })
        .state('inputValue', {
            url: '/inputValue',
            templateUrl: 'templates/tab-account.html',
            controller: 'HndleValue'

        })
        .state('scanValue', {
            url: '/scanValue:plugins',
            templateUrl: 'templates/plugins/barcode-scanner.html',
            controller: 'BarCodeScannerCtr'
        })
        .state('success', {
            url: '/success',
            templateUrl: 'templates/success.html',
            controller: 'SuccessCTRler'
        })
        .state('right', {
            url: '/right',
            templateUrl: 'templates/rightResponse.html',
            controller: 'RightCTRler'
        })
        .state('wrong', {
            url: '/wrong',
            templateUrl: 'templates/wrongResponse.html',
            controller: 'WrongCTRler'
        })
        .state('used',{
            url:'/used',
            templateUrl:'templates/usedResponse.html',
            controller: 'UsedCTRler'
        });

    $urlRouterProvider.otherwise('/home');
})

.factory('footer', function($rootScope) {

    var value = function(header) {
        $rootScope.isHeader = header;
    }

    return value;
})

.factory('$cordovaBarcodeScanner', ['$q', function($q) {

    return {
        scan: function() {
            var q = $q.defer();

            cordova.plugins.barcodeScanner.scan(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            });

            return q.promise;
        },

        encode: function(type, data) {
            var q = $q.defer();
            type = type || "TEXT_TYPE";

            cordova.plugins.barcodeScanner.encode(type, data, function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            });

            return q.promise;
        }
    };
}])

/// twitter feeds for application

.factory('TwitterService', function($cordovaOauth, $cordovaOauthUtility, $http, $resource, $q) {
        // 1
        var twitterKey = "STORAGE.TWITTER.KEY";
        var clientId = 'mAkCWZTQ3fyf2R102oEtyhhHl';
        var clientSecret = 'oFxgbFEUf5gws0QI6NpRMnZGwta2iGpXvGIIs5BPhZDzScF4fF';

        // 2
        function storeUserToken(data) {
            window.localStorage.setItem(twitterKey, JSON.stringify(data));
        }

        function getStoredToken() {
            return window.localStorage.getItem(twitterKey);
        }

        // 3
        function createTwitterSignature(method, url) {
            var token = angular.fromJson(getStoredToken());
            var oauthObject = {
                oauth_consumer_key: clientId,
                oauth_nonce: $cordovaOauthUtility.createNonce(10),
                oauth_signature_method: "HMAC-SHA1",
                oauth_token: token.oauth_token,
                oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
                oauth_version: "1.0"
            };
            var signatureObj = $cordovaOauthUtility.createSignature(method, url, oauthObject, {}, clientSecret, token.oauth_token_secret);
            $http.defaults.headers.common.Authorization = signatureObj.authorization_header;
        }

        return {
            // 4
            initialize: function() {
                var deferred = $q.defer();
                var token = getStoredToken();

                if (token !== null) {
                    deferred.resolve(true);
                } else {
                    $cordovaOauth.twitter(clientId, clientSecret).then(function(result) {
                        storeUserToken(result);
                        deferred.resolve(true);
                    }, function(error) {
                        deferred.reject(false);
                    });
                }
                return deferred.promise;
            },
            // 5
            isAuthenticated: function() {
                return getStoredToken() !== null;
            },
            // 6
            getHomeTimeline: function() {
                var home_tl_url = 'https://api.twitter.com/1.1/statuses/home_timeline.json';
                createTwitterSignature('GET', home_tl_url);
                return $resource(home_tl_url).query();
            },
            storeUserToken: storeUserToken,
            getStoredToken: getStoredToken,
            createTwitterSignature: createTwitterSignature
        };
    })
    /*.factory('pushNotifiaction', ['$q', '$window', '$timeout', '$rootScope', function($q, $window, $timeout, $rootScope){
        return {
            onNotification: function(notification){
                $timeout(function(){
                    $rootScope.$broadcast('$notificationRecived', notification);
                });
            },

            register : function(config){
                var q = $q.defer();
                var injector;
                if (config===undefined && config.ecb===undefined) {
                    if (document.querySelecter('[ng-app]')==null) {
                        injector = "document.body";
                            }else{
                                injector = "document.querySelecter('[ng-app]')";
                            }
                            config.ecb = "angular.element(" + injector + ").injector().get('pushNotifiaction').onNotification";
                };
            }
        };
    }])*/

.factory(("ionPlatform"), function($q) {
    var ready = $q.defer();

    ionic.Platform.ready(function(device) {
        ready.resolve(device);
    });

    return {
        ready: ready.promise
    }
})

.controller('DashCTR', function($scope, TwitterService, $ionicPlatform, footer, $ionicNavBarDelegate) {
    console.log("DashCTR");
    footer(false);
    $scope.correctTimestring = function(string) {
        return new Date(Date.parse(string));
    };

    $scope.showHomeTimeline = function() {
        $scope.home_timeline = TwitterService.getHomeTimeline();
    };

    $scope.doRefresh = function() {
        $scope.showHomeTimeline();
        $scope.$broadcast('scroll.refreshComplete');
    };

    /*$ionicPlatform.ready(function() {
        //debugger;
        if (TwitterService.isAuthenticated()) {
            $scope.showHomeTimeline();
        } else {
            TwitterService.initialize().then(function(result) {
                if (result === true) {
                    $scope.showHomeTimeline();
                }
            });
        }

    });*/


})

.controller('HndleValue', function($scope, $state, $cordovaPush, $cordovaDialogs, $cordovaToast, ionPlatform, $http, footer, $ionicNavBarDelegate) {
    //console.log("HndleValue");
    footer(false);
    $ionicNavBarDelegate.showBackButton(true);
    $scope.notifications = [];

    ionPlatform.ready.then(function(device) {
        $scope.register();
    });

    $scope.register = function() {
        var config = null;

        if (ionic.Platform.isAndroid()) {
            config = {
                "senderID": "heroic-muse-788" // heroic-muse-788 REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
            };
        } else if (ionic.Platform.isIOS()) {
            config = {
                "badge": "true",
                "sound": "true",
                "alert": "true"
            }
        }


        $cordovaPush.register(config).then(function(result) {
            console.log("Register success " + result);

            /*$cordovaToast.showShortCenter('Registered for push notifications');*/
            //$cordovaDialogs.confirm("Registered for push notifications", "", ["OK", "CANCEL"]);

            $scope.registerDisabled = true;
            // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
            if (ionic.Platform.isIOS()) {
                $scope.regId = result;
                storeDeviceToken("ios");
            }
        }, function(err) {
            console.log("Register error " + err)
        });
    }

    /*$scope.$on('$cordovaPush:notificationReceived', function(event, notification) {
        console.log(JSON.stringify([notification]));
        if (ionic.Platform.isAndroid()) {
            handleAndroid(notification);
        } else if (ionic.Platform.isIOS()) {
            handleIOS(notification);
            $scope.$apply(function() {
                $scope.notifications.push(JSON.stringify(notification.alert));
            })
        }
    });*/

    /*function handleAndroid(notification) {
        // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
        //             via the console fields as shown.
        console.log("In foreground " + notification.foreground + " Coldstart " + notification.coldstart);
        if (notification.event == "registered") {
            $scope.regId = notification.regid;
            storeDeviceToken("android");
        } else if (notification.event == "message") {
            $cordovaDialogs.alert(notification.message, "Push Notification Received");
            $scope.$apply(function() {
                $scope.notifications.push(JSON.stringify(notification.message));
            })
        } else if (notification.event == "error")
            $cordovaDialogs.alert(notification.msg, "Push notification error event");
        else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
    }Product not found.This might be a fake product.  original*/

    $scope.inputValueGo = function(value) {
        $scope.value1 = value;
        //debugger;
        //console.log($scope.value1);
        // https://github.com/hollyschinsky/PushNotificationSample/blob/master/www/js/controllers.js
        if ($scope.value1 !== undefined && $scope.value1.length > 0) {
            $http.post('https://o4s-api.herokuapp.com/checkProduct', {
                productCode: $scope.value1

            }).
            success(function(data, status, headers, config) {
                //$cordovaDialogs.alert(data.productCheck, "Pruduct Detail", "OK");

                // console.log(data);
                if (data.productCheck === "original") {
                    $state.go('right');
                }else if (data.productCheck ==="Product by this id is already sold.This might be a fake product.") {
                    $state.go('used');
                }else{
                    $state.go('wrong');
                }
            }).
            error(function(data, status, headers, config) {
                console.log(data);
            });
        } else {
            $cordovaDialogs.alert("Please Enter The Code", "Input Code", "OK");
            console.log("Please Enter The Code");
        }
    };

})

.controller('BarCodeScannerCtr', function($scope, $cordovaBarcodeScanner, footer, $ionicNavBarDelegate) {
    $ionicNavBarDelegate.showBackButton(true);
    footer(false);
    console.log("HndleScan");

    $scope.scan = function() {
        $cordovaBarcodeScanner.scan().then(
            function(barCode) {
                $scope.barcode = barCode;
                $scope.err = undefined;
            },
            function(err) {
                $scope.err = err;
            });

        $cordovaBarcodeScanner.encode(BarcodeScanner.Encode.TEXT_TYPE, "").then(
            function(success) {
                console.log("success", success);
            },
            function(error) {
                console.log("err", error);
            });

    };

})

.controller('SuccessCTRler', function($scope, footer) {
    //footer.isHeader= false;
    console.log('SuccessCTRler');
})

.controller('RightCTRler', function($scope, footer, $ionicNavBarDelegate) {
        footer(true);
        //$ionicNavBarDelegate.showBackButton(false);
        console.log("RightCTRler");
    })
    .controller('WrongCTRler', function($scope, $state, $stateParams, $ionicNavBarDelegate) {
        console.log('WrongCTRler');
        $scope.back = function() {
            $state.go('home');
            $ionicNavBarDelegate.showBackButton(false);
        };
    })

.controller('UsedCTRler', function($scope, $state, $stateParams, $ionicNavBarDelegate) {
    console.log('UsedCTRler');
    $scope.back = function(){
        $state.go('home');
        $ionicNavBarDelegate.showBackButton(false);
    };
})

.controller('FooterCTRler', function($scope, $rootScope, footer) {
    /* var isfooter = footer.isHeader;*/
    if ($rootScope.isHeader !== true) {
        $scope.isHeader = $rootScope.isHeader;
    }
    /*if($rootScope.isHeader!==false){
        $scope.isHeader = false;
    }*/
})
