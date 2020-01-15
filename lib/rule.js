const utils = require("./utils.js")

const eventVariables = require("./eventVariables.js")
const {
  responseTypes
} = require("./responseTypes.js")

const Rule = function(p_sName) {
  this.name = p_sName;
  this.event;
  this.rules = [];
  this.responses = [];
  this.isExclusive = false;
}

Rule.prototype = {
  exclusive() {
    this.isExclusive = true;
    return this;
  },
  if () {
    const that = this;
    return {
      isQuestion() {
        that.rules.push({
          type: "question",
          data: p_sText,
          detect(event, rule) {
            return (new eventVariables(event)).isQuestion();
          }
        })
        return this;
      },
      hasContext(context) {
        that.rules.push({
          type: "context",
          data: context,
          detect(event, rule) {
            return (new eventVariables(event)).context() === rule.data;
          }
        })

        return this
      },
      hasPayload(payload) {
        if (utils.isFunction(payload)) {
          that.rules.push({
            type: "payload_function",
            data: payload,
            detect(event, rule) {
              return rule.data(event);
            }
          })
        } else {
          that.rules.push({
            type: "payload_value",
            data: payload,
            detect(event, rule) {
              return (new eventVariables(event)).payload() === rule.data;
            }
          })
        }
        return this;
      },
      hasText(...args) {
        that.rules.push({
          type: "text",
          data: args,
          detect(event, rule) {
            return !!rule.data.filter(data => event.message.text.indexOf(data) !== -1).length
          }
        })
        return this;
      },
      //p_sType : positive|neutral|negative
      //p_iConfidence : 0 - 100
      hasSentiment(p_sType, p_iConfidence) {
        that.rules.push({
          type: "sentiment",
          data: {
            type: p_sType,
            confidence: ((p_iConfidence || 90) / 100)
          },
          detect(event, rule) {
            return !!(new eventVariables(event)).sentiment(rule.data.confidence, rule.data.type).length
          }
        })
        return this;
      },
      hasThanks(p_iConfidence) {
        that.rules.push({
          type: "thanks",
          data: {
            confidence: ((p_iConfidence || 90) / 100)
          },
          detect(event, rule) {
            return !!(new eventVariables(event)).thanks(rule.data.confidence).length
          }
        })
        return this;
      },
      hasBye(p_iConfidence) {
        that.rules.push({
          type: "bye",
          data: {
            confidence: ((p_iConfidence || 90) / 100)
          },
          detect(event, rule) {
            return !!(new eventVariables(event)).bye(rule.data.confidence).length
          }
        })
        return this;
      },
      hasGreetings(p_iConfidence) {
        that.rules.push({
          type: "greetings",
          data: {
            confidence: ((p_iConfidence || 90) / 100)
          },
          detect(event, rule) {
            return !!(new eventVariables(event)).greetings(rule.data.confidence).length
          }
        })
        return this;
      },
      then() {
        return that.then();
      }
    }
  },
  then() {
    const that = this;

    return {
      setText(p_sText) {
        that.responses.push({
          type: "text",
          data: p_sText
        })
        return this;
      },
      custom(fCustom) {
        that.responses.push({
          type: "custom",
          data: fCustom
        })
        return this;
      },
      if () {
        return that.then();
      }
    }
  },
  _process(event) {
    let bIsValid = true;

    for (let i in this.rules) {
      const oRule = this.rules[i];
      bIsValid = bIsValid && oRule.detect(event, oRule);
    }

    if (!bIsValid) return false;

    const eventData = (new eventVariables(event)).processAll();
    return Promise.all(this.responses.map(response => {
        switch (response.type) {
          case "text":
            return Promise.resolve(responseTypes.message(response.data));
          case "custom":
            return Promise.resolve(response.data(event, responseTypes, eventData));
        }
      }))
      .then(arroResponses => arroResponses.map(response => ({
        response,
        exclusive: this.isExclusive
      })))
      .catch(err => console.log(err))
  }
}

module.exports = Rule;
