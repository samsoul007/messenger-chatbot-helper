# messenger-chatbot-helper

A Nodejs module facilitating messenger chatbot setup.

# table of contents

<!-- TOC -->
- [disclaimer](#disclaimer)
- [installation](#installation)
- [usage](#usage)
  - [Create client](#create-client)
    - [MCH.version([version])](#mchversionversion)
    - [MCH.verificationToken([token])](#mchverificationtokentoken)
    - [MCH.pageToken(pageid [, pagetoken]);](#mchpagetokenpageid--pagetoken)
    - [MCH.onError(function)](#mchonerrorfunction)
    - [MCH.onEvent(function)](#mchoneventfunction)
  - [Create rules](#create-rules)
    - [exclusive()](#exclusive)
    - [hasContext(context)](#hascontextcontext)
    - [if() methods](#if-methods)
    - [then() methods](#then-methods)
  - [responseTypes](#responsetypes)
    - [message(text)](#messagetext)
    - [quickReply(title, payload [, image_url])](#quickreplytitle-payload--image_url)
    - [quickReplyGroup(title, replies [, context])](#quickreplygrouptitle-replies--context)
    - [button(title, url [, ratio])](#buttontitle-url--ratio)
    - [buttonGroup(title, buttons)](#buttongrouptitle-buttons)
  - [Full example](#full-example)

<!-- /TOC -->

# disclaimer

Setting up a Messenger chatbot can be a real hassle so this module was created to ease the configuration and the setup of it.

A lot of third-party companies provide facilitators for creating a chatbot through a nice user interface but it also means that the users' information are going through their servers. This module was made to address this and stay in control of the data sent to you.

**This is a BETA version and thus does not contain all the features yet and might still contain bugs.**

# installation

I will not describe how to setup anything on Facebook and will assume that you know how to set it up 😀

**Make sure that you enable NLP (Natural Language Processing) on your setup**

To install the module:
`npm install --save messenger-chatbot-helper`

# usage

The module works in two parts. First you need to setup the listeners from Facebook and then create the rules to apply to the data coming. All rules are currently global but you can setup multiple messenger bots on different endpoints.

When a request arrives on the server it will be parsed, processed and applied to the different rules you have setup.

**A full example is provided in the example.js file and at the end of this README**

## Create client

This was built to be compatible with Node Express and be as simple as possible to setup

The `MCH` variable is the main entry point of the module

```javascript
const express = require('express');
const body_parser = require('body-parser');
const app = express().use(body_parser.json());
const MCH = require('messenger-chatbot-helper');

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', MCH.webhook.get);

// Accepts POST requests at /webhook endpoint
app.post('/webhook', MCH.webhook.post);

app.listen(8080, () => {
  console.log('webhook is listening')
});
```


### MCH.version([version])
Get/Set the version of Facebook API you want to use.

```javascript
MCH.version("v5.0");
const version = MCH.version();
```

### MCH.verificationToken([token])
Get/Set the verification token used to validate your API. This is defined during the setup of Messenger on the Facebook App.

```javascript
MCH.verificationToken("some random token you defined");
const token = MCH.verificationToken();
```


### MCH.pageToken(pageid [, pagetoken]);
Get/Set the page token for accessing your page Messenger communications. This is created during the setup of Messenger on the Facebook App.

You can add as many page tokens as you wish allowing you to have one chatbot across multiple Facebook pages.

```javascript
MCH.pageToken("the page ID", "the page token");
const pageToken = MCH.pageToken("the page ID");
```


### MCH.onError(function)
You can define a function that will be called when an error occurs

```javascript
MCH.onError(err => {
  console.log("there has been an error:",err)
})
```

### MCH.onEvent(function)
You can define a function that will be called when an event from Messenger occurs

```javascript
MCH.onEvent(event => {
  console.log("there has been an event:",event)
})
```

## Create rules

Messenger API is a real pain when it comes to response, contexts and is not generally simple to use. I tried to create a semantically valid rule creator in order to simplify creation, collaboration and general reading-ness of the code.

**Please note that this is still a work in progress and all functions might not be available yet**

A rule will be defined as this:
- it has a name
- it can have an `if()`
- it must have a `then()`
- it can be `exclusive()` or not. If this rule is exclusive and valid then it will be the only rule `then()` returned to the Messenger chat

Rules are tested sequentially based on the order created in the code. I believe that it is easier to read like this instead of dealing with priorities and orders. I might add this if needed in the future.

Let's create our first rule now:
```javascript
MCH.createRule("hello rule")
  .exclusive()
  .if()
  .hasGreetings()
  .then()
  .setText("Hello there, what I can help you with?")
```

So let's analyse this rule
```javascript
MCH.createRule("hello rule")
```
This is going to create a rule with the name `hello rule`. The name is purely for development purposes and is not used anywhere else.

```javascript
  .exclusive()
```
This means that if the chatbot validate the rule, it will stop and just returns the response for this rule. By default a rule is non exclusive.

```javascript
  .if()
  .hasGreetings()
```
This is the condition for the rule to be valid. You can add as many chained tests after. The `if()` methods are detailed below

```javascript
  .then()
  .setText("Hello there, what I can help you with?")
```
This is the what the rule returns when it is valid. You can add as many chained returns after. The `then()` methods are detailed below. The returns will be sent back to the chat in the same order they were defined in the rule.


### exclusive()

If this method is executed inside a rule, this rule will be the only one returned upon validation. Otherwise the other rules added after will be processed.

### hasContext(context)

Some ReturnTypes can have a context name attached to it, allowing you to send back information based on the rule that was validated in the previous request. This is especially useful for menus. Check the `responseTypes` for more information.

### if() methods

This is not an exhaustive list and new ones will be added over time.

Common Methods

Name|Description  
--|--
`isQuestion()`|If the text is a question
`hasContext(context)`|If the response has a context attached. The `context` parameters is a string
`hasPayload(payload)`|If the response has a payload.
`hasText(text...)`|If the response has specific text. Multiple text can be passed as arguments and will be handle as an OR ( text1 or text2 , etc.).

NLP Methods

Those methods requires that NLP is enabled in the Messenger configuration on Facebook. This is highly recommended.

**The `confidence` parameter is optional and has a default value 90. Valid value 0 - 100**

Name|Description  
--|--
`hasSentiment(type, confidence)`|Will detect the general sentiment of the text. Values of `type` can be `positive`, `neutral`, `negative`
`hasThanks(confidence)`|Will detect if the text is some kind of thanks.
`hasBye(confidence)`|Will detect if the text is some kind of goodbye.
`hasGreetings(confidence)`|Will detect if the text is some kind of greetings.


### then() methods

This is not an exhaustive list and new ones will be added over time.

Name|Description  
--|--  
`setText(text)`|Create a text to be returned
`custom(function)`|Very useful is you want to do specific processing when the rule has been validated, like for example a search, a database query, etc. This function should always return a ResponseType of some kind<br><br>The function passed will be called with 3 parameters:<br>- The raw event<br>- The ReturnTypes<br>- The Parsed event data being a processed version of the raw event

Example:

```javascript
.custom((event, RT, eventData) => {
  // this is a custom rule.
  // Works as a promise and has to resolve or reject
  // Needs to return a ReturnType (RT)
  // evenData contains all the parsed information of the event such as NLPs, text, etc. for further processing

  const arroButtons = [
    RT.button("Google", "https://google.com"),
    RT.button("Bing", "https://bing.com")
  ]

  return RT.buttonGroup("Search engines:", arroButtons)
})
```

## responseTypes

Messenger returns information to the user based on a request. There are multiple types of responses, such as text, links, buttons, etc. This class allows you to easily send back information.

### message(text)

The simplest response. Will send back the `text` to the chat.
Parameters:
- `text`: string to send back to chat

### quickReply(title, payload [, image_url])

This is a quick reply button. Those buttons are only used for chatting, like showing a menu of options and cannot be used to open a URL. For this please check the `button` method.
Parameters:
- `title`: the text to be shown in button
- `payload`: the value this button will have. Will always be returned as string in `hasPayload()`
- `image_url`: an image to use as bullet in the button

**Quick reply button can only be sent from inside a quickReplyGroup**

### quickReplyGroup(title, replies [, context])

This is the container for the quick reply buttons.
Parameters:
- `title`: string will be shown as menu header (ex: 'Choose here:')
- `replies`: array of `quickReply` buttons
- `context`: this is used to defined on which specific context this button was clicked. You can combine it with `hasContext(context)` IF method.

### button(title, url [, ratio])

This is a web url button. Those buttons are only used for opening a URL in the Facebook webview on mobile app and a new tabulation on desktop.
Parameters:
- `title`: the text to be shown in button
- `url`: a valid URL to open (works with app URLs)
- `ratio`: the size of the webview to be open in the mobile version. Valid values are `compact`, `tall`, `full` (default `full`)

**Button can only be sent from inside a buttonGroup**

### buttonGroup(title, buttons)

This is the container for the buttons.
Parameters:
- `title`: string will be shown as menu header (ex: 'Choose here:')
- `buttons`: array of `button` buttons


## Full example
```javascript
const express = require('express');
const body_parser = require('body-parser');
const app = express().use(body_parser.json()); // creates express http server
const M = require('./index');
const RT = M.responseTypes; // response types to use outside of the Messenger context

//Settings
M.version("v5.0");
M.verificationToken("[your token here]");
M.pageToken("[your page ID]", "[your page content]");

//Events
M.onEvent(event => {
  console.log("event", event)
})

M.onError(err => {
  console.log("error", err)
})


app.get('/', (req, res) => res.status(200).send(`[${sEnv}] Messenger chatbot`));

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', M.webhook.get);

// Accepts POST requests at /webhook endpoint
app.post('/webhook', M.webhook.post);

// Sets server port and logs message on success
app.listen(8080, () => {
  console.log('webhook is listening')
});

//Anything below are rules

//Defining sample menus, RT is used here outside of the Messenger context
const menu = {
  main() {
    return RT.quickReplyGroup("Menu:", [RT.quickReply("menu1", "value1", "https://picsum.photos/300/300"), RT.quickReply("menu2", "value2", "https://picsum.photos/300/300")], "main_menu")
  },
  sub_menu() {
    return RT.quickReplyGroup("Please choose:", [RT.quickReply("sub_menu1", "sub_value1", "https://picsum.photos/300/300"), RT.quickReply("sub_menu2", "sub_value2", "https://picsum.photos/300/300")], "sub_menu")
  }
}

// Thank you rule
M.createRule("thank you")
  .exclusive()
  .if()
  .hasThanks()
  .then()
  .setText("You are welcome. Anything else I can help you with?")

// Hello rule
M.createRule("hello")
  .exclusive()
  .if()
  .hasGreetings()
  .then()
  .setText("Hello there, what I can help you with?")
  .custom((event, RT) => menu.main())

// Help rule
M.createRule("help")
  .exclusive()
  .if()
  .hasText("help")
  .then()
  .setText("You can ask a question such as 'find something'")
  .custom((event, RT) => menu.main())

// Menu rule
M.createRule("menu")
  .exclusive()
  .if()
  .hasText("menu")
  .then()
  .custom((event, RT) => menu.main())

// Find rule
M.createRule("find")
  .exclusive()
  .if()
  .hasText("find")
  .then()
  .custom((event, RT, eventData) => {
    // this is a custom rule.
    // Works as a promise and has to resolve or reject
    // Needs to return a ReturnType (RT)
    //evenData contains all the parsed information of the event such as NLPs, text, etc. for further processing

    const arroButtons = [
      RT.button("Google", "https://google.com"),
      RT.button("Bing", "https://bing.com")
    ]

    return RT.buttonGroup("Search engines:", arroButtons)
  })

// Sub menu rule
M.createRule("sub menu level")
  .exclusive()
  .if()
  .hasContext("main_menu")
  .then()
  .custom((event, RT, eventData) => {
    //payload from other menu
    eventData.payload;

    //Return sub menu
    return menu.sub_menu();
  });

// Sub menu choice
M.createRule("sub menu choice")
  .exclusive()
  .if()
  .hasContext("sub_menu")
  .then()
  .custom((event, RT, eventData) => {
    return RT.message(`you have selected ${eventData.payload}`);
  });

//This rule will be executed if no others are active
//Note that there are no IF attached
M.createRule("other")
  .then()
  .setText("Sorry I didn't understand your request.")
  .setText("You can ask a question such as 'find' or 'menu'")
  .custom((event, RT) => menu.main())



```
