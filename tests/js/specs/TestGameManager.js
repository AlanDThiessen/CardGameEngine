

angular.module('TestGameManager', []);


describe("GameManager", function () {
    var gameDataMgr;
    var mock;

    // Before each, make sure the module under test is loaded
    beforeEach(module('myServiceModule'));
    beforeEach(function() {
        mock = {alert: jasmine.createSpy()};

        module(function($provide) {
            $provide.value('$window', mock);
        });

        inject(function($injector) {
            notify = $injector.get('notify');
        });

/*
        angular.module('mock', []).config(['$provide', function($provide) {
            $provide.factory('winder', function() {
                return mock;
            });
        }]);

        var inject = angular.injector(['cge.utils.gameManager']);
        gameDataMgr = inject.get('cge.utils.GameManager');
*/

    });

    it('should not alert first two notifications', function() {
        notify('one');
        notify('two');

        expect(mock.alert).not.toHaveBeenCalled();
    });

    it('should alert all after third notification', function() {
        notify('one');
        notify('two');
        notify('three');

        expect(mock.alert).toHaveBeenCalledWith("one\ntwo\nthree");
    });

    it('should clear messages after alert', function() {
        notify('one');
        notify('two');
        notify('third');
        notify('more');
        notify('two');
        notify('third');

        expect(mock.alert.calls.count()).toEqual(2);
        expect(mock.alert.calls.mostRecent().args).toEqual(["more\ntwo\nthird"]);
    });
});
