

angular.module('TestGameManager', []);


describe("GameManager", function () {
    beforeEach(function() {
        module('cge.utils');
        inject(function($injector) {
            gameManager = $injector.get('cge.utils.GameManager');
        });
    });
});
