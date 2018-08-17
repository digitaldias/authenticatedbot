"use strict";

require('dotenv-extended').load();
const builder               = require('botbuilder');
const AuthenticationService = require('../../services/AuthenticationService');

var chatConnector;

describe("class AuthenticationService", () => 
{
    beforeEach( () => 
    {
        // This space for rent            
    });

    it("Uses an internal memoryStorage to preserve state", () => 
    {
        // Arrange
        spyOn(builder, "MemoryBotStorage").andCallThrough();

        // Act
        new AuthenticationService()

        // Assert
        expect(builder.MemoryBotStorage).toHaveBeenCalled();
    });    

    it("Obtains connection name from environment", () => 
    {
        // Act
        var instance = new AuthenticationService();

        // Assert
        expect(instance.connectionName).toBe(process.env.CONNECTION_NAME);
    });

    describe("CreateBot(chatConnector)", () => 
    {       
        beforeEach( () => 
        {
            // Create chat connector for communicating with the Bot Framework Service
            chatConnector = new builder.ChatConnector({
                appId      : process.env.MICROSOFT_APP_ID,
                appPassword: process.env.MICROSOFT_APP_PASSWORD
            });
        });

        it("Requires a valid chatConnector to function", () => 
        {
            // Arrange
            var dummyConnector = {};
            var instance = new AuthenticationService();

            // Act & Assert
            expect( () => {
                instance.CreateBot(dummyConnector);
            }).toThrow();
        })

        it("Creates a UniversalBot using the builder object", () => 
        {
            // Act
            var instance = new AuthenticationService();
            
            // Assert
            expect(instance.bot).not.toBeNull;            
        });
    });
});