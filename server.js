// This loads the environment variables from the .env file
require('dotenv-extended').load();

// Dependencies
var restify                 = require('restify');
var builder                 = require('botbuilder');
var AuthenticatedBotCreator = require('./services/AuthenticatedBotCreator');

// Setup Restify Server and start listening for incoming requests
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var chatConnector = new builder.ChatConnector({
    appId      : process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// tell server to listen for /api/messages and pass those messages to our chatConnector
server.post('/api/messages', chatConnector.listen());

// Set up a memory storage for the bot
const storage = new builder.MemoryBotStorage();

// Use The AuthenticationService to create a bot that asks the user to sign in
const authenticatedBotCreator = new AuthenticatedBotCreator();
const bot = authenticatedBotCreator.create(chatConnector, storage);

// Have the bot greet the user once added to the conversation
bot.on("conversationUpdate", (message) => 
{
    if(message.membersAdded && message.membersAdded.length > 0)
    {
        var isGroup = message.address.conversation.isGroup;
        var text = isGroup ? "Hello everyone!" : "Crickey! Hello there lonesome soldier!";
        var reply = new builder.Message()
            .address(message.address)
            .text(text);        
            bot.send(reply);
    }    
});
