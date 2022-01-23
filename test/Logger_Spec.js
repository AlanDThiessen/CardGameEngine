
describe("Logger", function () {
    let log;

    beforeEach(function () {
        log = require('../src/utils/Logger.js');
        spyOn(console, 'log');
        spyOn(console, 'warn');
        spyOn(console, 'error');
    });

    afterEach(function() {
        log = undefined;
    });

    it("It is a singleton", function() {
        let log2 = require('../src/utils/Logger.js');
        expect(log2).toBe(log);
    });

    it("Has everything", function() {
        expect(typeof log.GetDebugFlags).toEqual('function');
        expect(typeof log.SetLogMask).toEqual('function');
        expect(typeof log.GetLogMask).toEqual('function');
        expect(typeof log.GetDate).toEqual('function');
        expect(typeof log.debug).toEqual('function');
        expect(typeof log.info).toEqual('function');
        expect(typeof log.warn).toEqual('function');
        expect(typeof log.error).toEqual('function');
        expect(log.GetLogMask()).toEqual(0);
        expect(log.toConsole).toBeTrue();
        expect(log.toFile).toBeFalse();
    });

    it('Has all debug flags', function() {
        let flags = log.GetDebugFlags();

        expect(typeof flags).toEqual('object');
        expect(Object.keys(flags)).toContain('DEBUG');
        expect(Object.keys(flags)).toContain('INFO');
        expect(Object.keys(flags)).toContain('WARN');
        expect(Object.keys(flags)).toContain('ERROR');
    });

    it('Can set the log mask', () => {
        let flags = log.GetDebugFlags();

        log.SetLogMask(flags.DEBUG);
        expect(log.GetLogMask()).toEqual(flags.DEBUG);
        log.SetLogMask(flags.INFO);
        expect(log.GetLogMask()).toEqual(flags.INFO);
        log.SetLogMask(flags.WARN);
        expect(log.GetLogMask()).toEqual(flags.WARN);
        log.SetLogMask(flags.ERROR);
        expect(log.GetLogMask()).toEqual(flags.ERROR);
        log.SetLogMask(flags.DEBUG | flags.INFO | flags.WARN | flags.ERROR);
        expect(log.GetLogMask()).toEqual(flags.DEBUG | flags.INFO | flags.WARN | flags.ERROR);
    });

    it('Logs DEBUG to the console', () => {
        let flags = log.GetDebugFlags();
        log.SetLogMask(flags.DEBUG);
        log.debug('Logger logs DEBUG to the console.');
        expect(console.log).toHaveBeenCalled();
    });

    it('Logs INFO to the console', () => {
        let flags = log.GetDebugFlags();
        log.SetLogMask(flags.INFO);
        log.info('Logger logs INFO to the console.');
        expect(console.log).toHaveBeenCalled();
    });

    it('Logs WARN to the console', () => {
        let flags = log.GetDebugFlags();
        log.SetLogMask(flags.WARN);
        log.warn('Logger logs WARN to the console.');
        expect(console.warn).toHaveBeenCalled();
    });

    it('Logs ERROR to the console', () => {
        let flags = log.GetDebugFlags();
        log.SetLogMask(flags.ERROR);
        log.error('Logger logs ERROR to the console.');
        expect(console.error).toHaveBeenCalled();
    });

});
