// why there is no builtin assert?
export function assert(cond: any) {
    if (!cond)
        throw new Error("Assertion failure");
}
