"use strict";

require('dotenv-extended').load();
const builder                 = require('botbuilder');
const AuthenticatedBotCreator = require('../../services/AuthenticatedBotCreator');

var chatConnector;

describe("class AuthenticatedBotCreator", () => 
{
    beforeEach( () => 
    {
        // This space for rent            
    });


    it("Obtains connection name from environment", () => 
    {
        // Act
        var instance = new AuthenticatedBotCreator();

        // Assert
        expect(instance.connectionName).toBe(process.env.CONNECTION_NAME);
    });

    describe("create(chatConnector, storage)", () => 
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
            var instance = new AuthenticatedBotCreator();

            // Act & Assert
            expect( () => {
                instance.create(dummyConnector);
            }).toThrow();
        })

        it("Requires a valid storage to function", () => 
        {
            // Arrange
            var dummyStorage = {};
            var instance = new AuthenticatedBotCreator();

            // Act
            expect( () => {
                instance.create(chatConnector, dummyStorage);
            }).not.toThrow();
        });

        it("Creates a UniversalBot using the builder object", () => 
        {
            // Act
            var instance = new AuthenticatedBotCreator();
            
            // Assert
            expect(instance.bot).not.toBeNull;            
        });
    });
});