const { Parser } = require('binary-parser');

class ACRemoteTelemetryParser extends Parser {
  constructor() {
    super();
  }

  fromBuffer(buffer) {
    return this.parse(buffer);
  }
}

module.exports = ACRemoteTelemetryParser;