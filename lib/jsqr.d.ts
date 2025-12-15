declare module 'jsqr' {
    interface Options {
        inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth" | "invertFirst";
    }

    interface Code {
        binaryData: number[];
        data: string;
        chunks: any[];
        location: any;
    }

    function jsQR(data: Uint8ClampedArray, width: number, height: number, options?: Options): Code | null;

    export = jsQR;
}
