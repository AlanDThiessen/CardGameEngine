
angular.module("cge.utils.gameManager", []).
    factory('cge.utils.GameManager', ['$window', function(win) {

    var msgs = [];

    return function(msg) {
        msgs.push(msg);
        if (msgs.length == 3) {
            win.alert(msgs.join("\n"));
            msgs = [];
        }
    };

}]);
