'use strict';

const dgram = require('dgram');
const EventEmitter = require('events');

// Importing parsers
const HandshakerResponseParser = require('./parsers/HandshakerResponseParser');
const RTCarInfoParser = require('./parsers/RTCarInfoParser');
const RTLapParser = require('./parsers/RTLapParser');

const AC_SERVER_PORT = 9996;

const deviceIdentifier = {
  eIPhoneDevice: 0,
  eIPadDevice: 1,
  eAndroidPhone: 2,
  eAndroidTablet: 3
};

const operation = {
  HANDSHAKE: 0,
  SUBSCRIBE_UPDATE: 1,
  SUBSCRIBE_SPOT: 2,
  DISMISS: 3
};

const event = {
  HANDSHAKER_RESPONSE: 'HANDSHAKER_RESPONSE',
  RT_CAR_INFO: 'RT_CAR_INFO',
  RT_LAP: 'RT_LAP'
};

class ACRemoteTelemetryClient extends EventEmitter {
  constructor(acServerId) {
    super();
    this.acServerIp = acServerId;
    this.client = dgram.createSocket('udp4');
  }

  start() {
    if (!this.client) {
      return;
    }

    this.client.on('listening', () => {
      console.log(`UDP Client listening on ${this.acServerIp}:${AC_SERVER_PORT}`);
    });

    this.client.on('error', (error) => {
      console.log(`UDP Client error`, error);
    });

    this.client.on('message', (msg, rinfo) => {
      this.parseMessage(msg, rinfo);
    });

    this.client.bind();

    // console.log(this.client.address().port);
  }

  stop() {
    if (!this.client) {
      return;
    }

    this.client.close(() => {
      console.log('UDP Client closed 🏁');
      this.client = null;
    });
  }

  sendHandshaker(op, identifier = 1, version = 1) {
    const handshaker = {
      identifier,
      version,
      operationId: op
    };
  
    // Convert the structured data into a Buffer
    const message = Buffer.alloc(12);
    message.writeInt32LE(handshaker.identifier, 0);
    message.writeInt32LE(handshaker.version, 4);
    message.writeInt32LE(handshaker.operationId, 8);
  
    // Send the message to the server
    this.client.send(message, 0, message.length, AC_SERVER_PORT, this.acServerIp);
  }

  // sendHandshaker(op, identifier = deviceIdentifier.eIPhoneDevice, version = AC_SERVER_VERSION) {
  //   const message = Buffer.alloc(12);

  //   message.writeInt32LE(identifier, 0);
  //   message.writeInt32LE(version, 4);
  //   message.writeInt32LE(op, 8);

  //   this.client.send(message, 0, message.length, AC_SERVER_PORT, this.acServerIp);
  // }

  handshake() {
    this.sendHandshaker(operation.HANDSHAKE);
  }

  subscribeUpdate() {
    this.sendHandshaker(operation.SUBSCRIBE_UPDATE);
  }

  subscribeSpot() {
    this.sendHandshaker(operation.SUBSCRIBE_SPOT);
  }

  dismiss() {
    this.sendHandshaker(operation.DISMISS);
  }

  parseMessage(msg, rinfo) {
    switch (rinfo.size) {
      case 408:
        this.emit(event.HANDSHAKER_RESPONSE, new HandshakerResponseParser().fromBuffer(msg));
        break;
      case 328:
        this.emit(event.RT_CAR_INFO, new RTCarInfoParser().fromBuffer(msg));
        break;
      case 212:
        this.emit(event.RT_LAP, new RTLapParser().fromBuffer(msg));
        break;
      default:
    }
  }
}

module.exports = ACRemoteTelemetryClient;
