const rp = require('request-promise');
const NodeCache = require('node-cache');
const myCache = new NodeCache();
const async = require("async")

const Rule = require("./lib/rule.js");
const eventVariables = require("./lib/eventVariables.js")
const {
  setContextDelimiter,
  responseTypes
} = require("./lib/responseTypes.js")

let version = "v5.0";
let verification_token = "";
const pageTokens = {};
const rules = [];

const on = {}

const callFbApi = (senderId, recipientId, response) => {
  return new Promise((resolve, reject) => {
    if (!pageTokens[recipientId]) {
      return reject(`No token for page '${recipientId}' set.`)
    }

    const request_body = {
      "recipient": {
        "id": senderId
      },
      ...response
    }

    const oReturn = {
      "method": "POST",
      "qs": {
        "access_token": pageTokens[recipientId]
      },
      "uri": `https://graph.facebook.com/${version}/me/messages`,
      "body": request_body,
      "json": true
    }

    // console.log(JSON.stringify(oReturn, null, 2))
    // return resolve(true);
    // Send the HTTP request to the Messenger Platform
    return rp(oReturn)
      .then(body => {
        if (body.error) {
          return reject(body.error);
        }

        return resolve(true);
      })
  })
}

const Messenger = function(senderId, recipientId, event) {
  this.senderId = senderId;
  this.recipientId = recipientId;
  this.event = event;
  this.response = {};

  this.run = response => {
    return callFbApi(this.senderId, this.recipientId, response)
  }
}

Messenger.prototype = {
  //activate typing on chat
  typing(isTyping) {
    return this.run({
        "sender_action": isTyping ? "typing_on" : "typing_off"
      })
      .then(() => this)
  },
  process() {
    return Promise.resolve()
      .then(() => this.typing(true))
      .then(() => Promise.all(rules.map(rule => rule._process(this.event))))
      .then(values => [].concat(...values))
      .then(arrsResponses => {
        const exclusiveResponse = arrsResponses.filter(resp => resp.response !== false && resp.exclusive)
        if (exclusiveResponse.length) {
          // console.log("using exclusive", exclusiveResponse[0])
          return [exclusiveResponse[0]];
        }
        return arrsResponses.filter(resp => resp !== false);
      })
      .then(arrsResponses => arrsResponses.map(resp => resp.response))
      .then(arrsResponses => {
        // console.log("responses", arrsResponses)
        if (arrsResponses.length) {
          return new Promise((resolve, reject) => {
            return async.eachSeries(arrsResponses, (response, cb) => {
              this.run(response)
                .then(() => cb())
                .catch(err => cb(err))
            }, err => {
              if (err)
                return reject(err);

              resolve()
            })
          })
        }

        if (arrsResponses.length)
          return Promise.all(arrsResponses.map(response => this.run(response)))

        return this.typing(false);
      })
      .catch(err => on.error && on.error(err))
  }
}


module.exports = {
  responseTypes,
  setContextDelimiter,
  onEvent(fFunction) {
    on.event = fFunction;
  },
  onError(fFunction) {
    on.error = fFunction;
  },
  createRule(p_sName) {
    const rule = new Rule(p_sName);
    rules.push(rule)
    return rule;
  },
  //Webhook functions for express
  webhook: {
    get(req, res) {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token === verification_token) {
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);
        }
      }
    },
    post(req, res) {
      res.status(200).send('ok');

      const body = req.body;
      // Check the webhook event is from a Page subscription
      if (body.object === 'page') {

        // Gets the body of the webhook event
        const event = body.entry[0].messaging[0];
        const messageID = event.message.mid;

        if (!event.message.is_echo && !myCache.get(messageID)) {
          on.event && on.event(body);

          myCache.set(messageID, messageID, 3000);
          // Get the sender PSID
          const senderId = event.sender.id;
          const recipientId = event.recipient.id;


          const oMsg = new Messenger(senderId, recipientId, event);
          oMsg.process();
        }
      }
    },
  },
  //add a new page token
  pageToken(p_sPageID, p_sToken) {
    if (!p_sToken) return pageTokens[p_sPageID];

    pageTokens[p_sPageID] = p_sToken;
  },
  //set the verification token
  verificationToken(p_sToken) {
    if (!p_sToken) return p_sToken;

    verification_token = p_sToken;
  },
  //set the FB api version
  version(p_sVersion) {
    if (!p_sVersion) return p_sVersion;

    version = p_sVersion;
  }
}
