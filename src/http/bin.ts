import {Body, Chunk, get, Handler, isBody, notFound, ok, post, Request, Response} from ".";
import {match, case_, default_, Matched, regex} from "../pattern";
import {repeat} from "../sequence";

export class BinHandler implements Handler {
    handle(request: Request): Promise<Response> {
        return match(request,
            case_(get('/get'), this.get),
            case_(post('/post'), this.post),
            case_({method: 'GET', uri: regex(/\/stream-bytes\/(\d+)/)}, this.streamBytes),
            default_(this.notFound));
    }

    async get(request: Matched<Request>) {
        return ok();
    }

    async post({body}: Matched<Request>) {
        if (isBody(body)) {
            const data = await body.text();
            return ok({}, JSON.stringify({data}));
        }
        return ok();
    }

    async streamBytes({uri: [size]}: Matched<Request>) {
        return ok({}, new ByteBody(randomBytes(size)));
    }

    async notFound() {
        return notFound();
    }
}


function randomBytes(length: number) {
    const buffer = repeat(Math.random).take((length / 4) + 1).toArray();

    return new Uint8Array(Float32Array.from(buffer).buffer).slice(0, length);
}

export class ByteChunk implements Chunk {
    constructor(private value: Uint8Array) {
    }

    text(): string {
        throw new Error("Unsupported operation error");
    }

    data(): Uint8Array {
        return this.value;
    }
}

export class ByteBody implements Body {
    constructor(private value: Uint8Array) {
    }

    text(): Promise<string> {
        throw new Error("Unsupported operation error");
    }

    async * [Symbol.asyncIterator](): AsyncIterator<Chunk> {
        yield new ByteChunk(this.value);
    }
}