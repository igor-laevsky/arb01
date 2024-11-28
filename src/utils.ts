// why there is no builtin assert?
export function assert(cond: any): asserts cond {
    if (!cond)
        throw new Error("Assertion failure");
}
