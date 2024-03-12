import {Buffer} from 'node:buffer';
import {Transform} from 'node:stream';

const TERMINATION = Buffer.from('</body></html>');

export class TopLevelLongPoll extends Transform {

  constructor(pump) {
    super();
    this.pump = pump;
  }

  async _flush(done) {
    await this.pump((chunk) => {
      this.push(chunk);
    });
    this.push(TERMINATION);
    done();
  }

  _transform(chunk, encoding, done) {
    if (0 === Buffer.compare(TERMINATION, chunk.slice(-TERMINATION.length))) {
      this.push(chunk.slice(0, -TERMINATION.length));
      done();
    }
    else {
      this.push(chunk);
      done();
    }
  }

}

