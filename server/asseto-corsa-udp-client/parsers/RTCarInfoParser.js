const ACRemoteTelemetryParser = require('./ACRemoteTelemetryParser');

class RTCarInfoParser extends ACRemoteTelemetryParser {
  constructor() {
    super();
    this.endianess('little')
      .string('identifier', { encoding: 'utf-16le', length: 4, stripNull: true }) // Offset: 0
      .int32le('size') // Offset: 4

      .floatle('speedKmh') // Offset: 8
      .floatle('speedMph') // Offset: 12
      .floatle('speedMs') // Offset: 16

      .int8('isAbsEnabled') // Offset: 20
      .int8('isAbsInAction') // Offset: 21
      .int8('isTcInAction') // Offset: 22
      .int8('isTcEnabled') // Offset: 23
      .int8('isInPit') // Offset: 24
      .int8('isEngineLimiterOn') // Offset: 25
      .skip(2) // Unknown 2 bytes

      .floatle('accGVertical') // Offset: 28
      .floatle('accGHorizontal') // Offset: 32
      .floatle('accGFrontal') // Offset: 36

      .int32le('lapTime') // Offset: 40
      .int32le('lastLap') // Offset: 44
      .int32le('bestLap') // Offset: 48
      .int32le('lapCount') // Offset: 52

      .floatle('gas') // Offset: 56
      .floatle('brake') // Offset: 60
      .floatle('clutch') // Offset: 64
      .floatle('engineRPM') // Offset: 68
      .floatle('steer') // Offset: 72
      .int32le('gear') // Offset: 76
      .floatle('cgHeight') // Offset: 80

      // Continue with other fields...

      .floatle('carCoordinatesY') // Offset: 320
      .floatle('carCoordinatesZ'); // Offset: 324
  }
}

module.exports = RTCarInfoParser;
