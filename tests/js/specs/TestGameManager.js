
// Pull in the module we're testing.
//var fileSystem = require("../../../src/js/utils/GameManager.js");
var gameDataMgr;
var mock;


describe("GameManager", function () {
    beforeEach(function() {
        mock = {alert: jasmine.createSpy()};

        module(function($provide) {
            $provide.value('$window', mock);
        });

        inject(function($injector) {
            gameDataMgr = $injector.get('cge.utils.GameManager');
        });
    });

    it('should not alert first two notifications', function() {
        gameDataMgr('one');
        gameDataMgr('two');

        expect(mock.alert).not.toHaveBeenCalled();
    });

    it('should alert all after third notification', function() {
        gameDataMgr('one');
        gameDataMgr('two');
        gameDataMgr('three');

        expect(mock.alert).toHaveBeenCalledWith("one\ntwo\nthree");
    });

});
