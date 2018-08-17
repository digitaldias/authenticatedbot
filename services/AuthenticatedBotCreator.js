"use strict";

require('dotenv-extended').load();
var builder = require('botbuilder');

/**
 *  
 */
module.exports = class AuthenticatedBotCreator
{
    constructor()    
    {
        this.connectionName  = process.env.CONNECTION_NAME;                
        this.bot             = {};        
    }

    /**
     * Creates the bot with the necessary wiring for authenticating the user
     * @param {*} chatConnector 
     */
    create(chatConnector, storage)
    {
        if(!chatConnector)
            throw new Error("CreateBot was called without a valid chatConnector");

        if(!storage)
            throw new Error("Storage must be a valid storage object");
        
        var that = this;
        that.bot = new builder.UniversalBot(chatConnector, function (session) 
        {
            chatConnector.getUserToken(session.message.address, that.connectionName, undefined, (err, result) => 
            {
                if(err && err.message)
                {
                    console.log("You don't appear to be signed in"); 
                }

                if(session.message.text == 'signout')
                {
                    chatConnector.signOutUser(session.message.address, that.connectionName, (err, result) => 
                    {
                        if(result)
                        {
                            console.log("Result of signOutUser: " + JSON.stringify(result))
                        }
                        
                        if(!err)
                        {
                            session.send("You're now signed out");
                        }
                        else
                        {
                            session.send("There was a problem signing you out:" + err.message)
                        }
                    });
                }
                else
                {                    
                    chatConnector.getUserToken(session.message.address, that.connectionName, undefined, (err, result) => 
                    {                        
                        if(!result)
                        {
                            if(!session.userData.activeSignIn)            
                            {
                                session.send("Hello! Let's get you signed in!");
                                builder.OAuthCard.create(chatConnector, session, that.connectionName, "Sign in", "sign in", (createSignInErr, signInMessage) => 
                                {
                                    if(signInMessage) 
                                    {
                                        session.send(signInMessage);
                                        session.userData.activeSignIn = true;
                                    }
                                    else
                                    {
                                        session.send("Something went wrong trying to sign you in.");
                                    }                            
                                });
                            }
                            else
                            {                                
                                chatConnector.getUserToken(session.message.address, that.connectionName, session.message.text,(err2, tokenResponse) => 
                                {
                                    if(tokenResponse)
                                    {
                                        session.send("It worked! You are now signed in with token: " + tokenResponse.token);
                                        session.userData.activeSignIn = false;
                                    }
                                    else
                                    {                                        
                                        session.send("We had problems signing you in.");
                                    }
                                });
                            }
                        }
                    });
                }
            });
        })
        .set('storage', storage)
        .on("event", (event) => {
            if(event.name == 'tokens/response')
            {
                that.bot.loadSession(event.address, (err, session) => 
                {
                    let tokenResponse = event.value;
                    session.send("You are now signed in with token: " + tokenResponse.token);
                    session.userData.activeSignIn = false;
                });
            }
        });

        chatConnector.onInvoke((event, callBack) => 
        {
            if(event.name == 'signin/verifyState')
            {
                that.bot.loadSession(event.address, (err, session) => 
                {
                    let verificationCode = event.value.state;

                    chatConnector.getUserToken(session.message.address, this.connectionName, verificationCode, (err, result) => 
                    {
                        session.send("You're now signed in with token: " + result.token);
                        session.userData.activeSignIn = false;
                        callBack(undefined, {}, 200);
                    });
                });
            }
            else
            {
                callBack(undefined, {}, 200);
            }
        }); 
        return that.bot;               
    }
}