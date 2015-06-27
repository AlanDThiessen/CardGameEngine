/**
 * Created by athiessen on 6/27/15.
 */
angular.module('TestConfig', []);

describe("Config", function() {

    var TEST_USER_NAME = "TestUserName";
    var TEST_PASSWORD  = "TestPassword";
    var TEST_LOG_MASK  = 05;

    beforeEach(function() {
        module('cge.utils');
        inject(function($injector) {
            config = $injector.get('cge.utils.Config');
        });
    });

    it("sets/gets UserName", function() {
        config.SetUserName(TEST_USER_NAME);
        expect(config.GetUserName()).toEqual(TEST_USER_NAME);
        config.SetUserName('');
        expect(config.GetUserName()).toEqual('');
    });

    it("sets/gets Password", function() {
        config.SetPassword(TEST_PASSWORD);
        expect(config.GetPassword()).toEqual(TEST_PASSWORD);
        config.SetPassword('');
        expect(config.GetPassword()).toEqual('');
    });

    it("sets/gets Log Mask", function() {
        config.SetLogMask(TEST_LOG_MASK);
        expect(config.GetLogMask()).toEqual(TEST_LOG_MASK);
        config.SetLogMask(0);
        expect(config.GetLogMask()).toEqual(0);
    });

    it("sets/gets Log to Console", function() {
        config.SetLogToConsole(true);
        expect(config.GetLogToConsole()).toBeTruthy();
        config.SetLogToConsole(false);
        expect(config.GetLogToConsole()).not.toBeTruthy();
    });

    it("sets/gets Log to File", function() {
        config.SetLogToFile(true);
        expect(config.GetLogToFile()).toBeTruthy();
        config.SetLogToFile(false);
        expect(config.GetLogToFile()).not.toBeTruthy();
    });

});