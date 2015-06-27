
angular.module('TestFileSystem', []);


// These tests must have Cordova to run
if(window.cordova) {
    describe( "FileModule", function() {
        var fsStatus = false;
        var fsError = null;
        var testStr1 = "Test writing to the file.";
        var testStr2 = "Test appending to the file.";
        var fileSystem = angular.injector(['cge.utils']).get('cge.utils.FileSystem');   // Get the FileSystem once

        var CommonExpectations = function() {
            expect(fsError).toBeNull();
            expect(fsStatus).toBeTruthy();
        };

        beforeEach(function() {
            fsStatus = false;
            fsError = null;
        });

        it("initializes the file system", function(done) {
            var OnReady = function(status) {
                fsStatus = status;
                CommonExpectations();
                InitExpectations();
                done();
            };

            var Failure = function(errorCode, errorStr) {
                fsError = errorStr;
                CommonExpectations();
                done();
            };

            var InitExpectations = function() {
                expect(fileSystem.dirEntries.appStorageDir).toBeDefined();
                expect(fileSystem.dirEntries.gamesDefsDir).toBeDefined();
                expect(fileSystem.dirEntries.deckDefsDir).toBeDefined();
                expect(fileSystem.dirEntries.activeGamesDir).toBeDefined();

                expect(fileSystem.dirEntries.appStorageDir.isDirectory).toBeTruthy();
                expect(fileSystem.dirEntries.gamesDefsDir.isDirectory).toBeTruthy();
                expect(fileSystem.dirEntries.deckDefsDir.isDirectory).toBeTruthy();
                expect(fileSystem.dirEntries.activeGamesDir.isDirectory).toBeTruthy();
            };

            fileSystem.InitFileSystem(OnReady, Failure);
        });

        describe("-with log file,", function() {
            it("opens the file", function (done) {
                var OnOpenReady = function (status) {
                    fsStatus = status;
                    CommonExpectations();
                    expect(fileSystem.fileEntries.log).toBeDefined();
                    expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.log.writer).toBeDefined();
                    done();
                };

                var OnOpenWrite = function () {
                    // Do nothing here.
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                fileSystem.OpenLogFile(OnOpenReady, OnOpenWrite);
            });

            it("writes the file", function (done) {
                var OnWriteReady = function (status) {
                    fsStatus = status;
                    fileSystem.WriteLogFile(false, testStr1);
                };

                var OnWriteEnd = function () {
                    CommonExpectations();
                    expect(fileSystem.fileEntries.log).toBeDefined();
                    expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.log.writer).toBeDefined();
                    expect(fileSystem.fileEntries.log.writer.length).toEqual(testStr1.length);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                // Log file should already be open, just change its callbacks
                fileSystem.OpenLogFile(OnWriteReady, OnWriteEnd);
            });

            it("appends the file", function (done) {
                var OnAppendReady = function (status) {
                    fsStatus = status;
                    fileSystem.WriteLogFile(false, testStr2);
                };

                var OnAppendEnd = function () {
                    CommonExpectations();
                    expect(fileSystem.fileEntries.log).toBeDefined();
                    expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.log.writer).toBeDefined();
                    expect(fileSystem.fileEntries.log.writer.length).toEqual(testStr1.length + testStr2.length);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                // Log file should already be open, just change its callbacks
                fileSystem.OpenLogFile(OnAppendReady, OnAppendEnd);
            });

            it("reads the file", function (done) {
                var OnReadComplete = function (data) {
                    fsStatus = true;
                    CommonExpectations();
                    expect(data.length).toEqual(testStr1.length + testStr2.length);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                // Log file should already be open, just change its callbacks
                fileSystem.ReadLogFile(OnReadComplete);
            });

            it("clears the file", function (done) {
                var OnClearReady = function (status) {
                    fsStatus = status;
                };

                var OnClearEnd = function () {
                    CommonExpectations();
                    expect(fileSystem.fileEntries.log).toBeDefined();
                    expect(fileSystem.fileEntries.log.entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.log.writer).toBeDefined();
                    expect(fileSystem.fileEntries.log.writer.length).toEqual(0);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                // Log file should already be open, just change its callbacks
                fileSystem.OpenLogFile(OnClearReady, OnClearEnd);
                fileSystem.ClearLogFile();
            });
        });


        describe("-with deck specification file,", function() {

            beforeEach(function() {
                module('test.data.mockGamedata');
                inject(function($injector) {
                    dataDeckSpec = $injector.get('test.data.mockGamedata').deckSpec;
                });
            });

            it("writes a file", function (done) {
                var OnWriteDeck = function () {
                    fsStatus = true;
                    CommonExpectations();
                    expect(fileSystem.fileEntries.deckDefs['standard']).toBeDefined();
                    expect(fileSystem.fileEntries.deckDefs['standard'].entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.deckDefs['standard'].writer).toBeDefined();
                    expect(fileSystem.fileEntries.deckDefs['standard'].writer.length).toEqual(angular.toJson(dataDeckSpec).length);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                fileSystem.WriteDeckSpec(dataDeckSpec['cge_deck']['id'], dataDeckSpec, OnWriteDeck);
            });

            it("reads a file", function (done) {
                var OnReadDeck = function (deckSpec) {
                    fsStatus = true;
                    CommonExpectations();
                    expect(deckSpec).toBeDefined();
                    expect(deckSpec).toEqual(dataDeckSpec);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                // Log file should already be open, just change its callbacks
                fileSystem.ReadDeckSpec("standard", OnReadDeck);
            });
        });

        describe("-with a game specification file,", function() {

            beforeEach(function() {
                module('test.data.mockGamedata');
                inject(function($injector) {
                    dataGameSpec = $injector.get('test.data.mockGamedata').gameSpec;
                });
            });

            it("writes a file", function (done) {
                var OnWriteGame = function () {
                    fsStatus = true;
                    CommonExpectations();
                    expect(fileSystem.fileEntries.gameDefs['simple-war']).toBeDefined();
                    expect(fileSystem.fileEntries.gameDefs['simple-war'].entry.isFile).toBeTruthy();
                    expect(fileSystem.fileEntries.gameDefs['simple-war'].writer).toBeDefined();
                    expect(fileSystem.fileEntries.gameDefs['simple-war'].writer.length).toEqual(angular.toJson(dataGameSpec).length);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                fileSystem.WriteGameSpec(dataGameSpec['cge_game']['id'], dataGameSpec, OnWriteGame);
            });

            it("reads a file", function (done) {
                var OnReadGame = function (gameSpec) {
                    fsStatus = true;
                    CommonExpectations();
                    expect(gameSpec).toBeDefined();
                    expect(gameSpec).toEqual(dataGameSpec);
                    done();
                };

                var Failure = function (errorCode, errorStr) {
                    fsError = errorStr;
                    CommonExpectations();
                    done();
                };

                fileSystem.SetErrorCallback(Failure);
                fileSystem.ReadGameSpec("simple-war", OnReadGame);
            });
        });

        xit("writes a game file for a given user", function() {
        });

        xit("reads a game file for a given user", function() {
        });
    });
}


