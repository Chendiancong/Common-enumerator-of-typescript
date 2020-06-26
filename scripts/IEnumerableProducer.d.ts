interface IEnumeratorState<T>
{
    value: T,
    done: false|true,
    nestedEnumerator: any
}

interface IEnumerator<T> extends Iterator<T>
{
    next: () => IEnumeratorState<T>,
    state: IEnumeratorState<T>
}

interface IEnumerable<TReturn> extends Iterable<TReturn>
{
    [Symbol.iterator]: () => IEnumerator<TReturn>,
    where: (handle: (elem: TReturn) => boolean) => IEnumerable<TReturn>,
    select: <TReturn2>(handle: (elem: TReturn) => TReturn2) => IEnumerable<TReturn2>,
    count: () => number,
    toArray: () => TReturn,
    orderby: <TKey extends number>(handle: (elem: TReturn) => TKey) => IEnumerable<TReturn>,
    orderbyDescending: <TKey extends number>(handle: (elem: TReturn) => TKey) => IEnumerable<TReturn>,
    forEach: (handle: (elem: TReturn) => any) => void,
    getEnumerator: () => IEnumerator<TReturn>,
    debug: () => void
}