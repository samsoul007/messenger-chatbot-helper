const {
  getContextDelimiter
} = require("./responseTypes.js")

const eventVariables = function(event) {
  this.event = event;
  this.nlpEntities = (this.event.message.nlp && this.event.message.nlp.entities) || {};
};

eventVariables.prototype = {
  isQuestion() {
    return this.event.message.text.indexOf("?") !== -1
  },
  sentiment(confidence, type) {
    return (this.nlpEntities.sentiment && this.nlpEntities.sentiment.filter(a => a.confidence >= confidence && (!type || a.value === type)).map(a => ({value:a.value}))) || []
  },
  payload() {
    return this.event.message.quick_reply && this.event.message.quick_reply.payload.split(getContextDelimiter())[0] || false;
  },
  context() {
    return this.event.message.quick_reply && this.event.message.quick_reply.payload.split(getContextDelimiter())[1] || false;
  },
  thanks(confidence) {
    return (this.nlpEntities.thanks && this.nlpEntities.thanks.filter(a => a.confidence >= confidence).map(a => ({value:a.value}))) || []
  },
  bye(confidence) {
    return (this.nlpEntities.bye && this.nlpEntities.bye.filter(a => a.confidence >= confidence).map(a => ({value:a.value}))) || []
  },
  greetings(confidence) {
    return (this.nlpEntities.greetings && this.nlpEntities.greetings.filter(a => a.confidence >= confidence).map(a => ({value:a.value}))) || []
  },
  distance(confidence) {
    return (this.nlpEntities.distance && this.nlpEntities.distance.filter(a => a.confidence >= confidence).map(a => ({value:a.from.value,unit:a.from.unit,original:a._body}))) || []
  },
  processAll(p_iConfidence) {
    const confidence = (p_iConfidence || 90) / 100;
    return {
      isQuestion: this.isQuestion(),
      sentiment: this.sentiment(confidence),
      payload: this.payload(),
      thanks: this.thanks(confidence),
      bye: this.bye(confidence),
      greetings: this.greetings(confidence),
      distance: this.distance(confidence),
      context: this.context()
    }
  }
}

module.exports = eventVariables;
