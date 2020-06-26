// 创建一个迭代器生成器，可用于for..of..里面
// 数据源指向原来的引用，但是会在迭代的时候才进行求值
// 可以支持Arry，Map以及一般对象

var _originNext = function() {
    if (this.sourceType == "Array")
    {
        this.state.value = this.source[++this.curIndex]||null;
        this.state.done = this.source.length <= this.curIndex;
    } else if (this.sourceType == "Map")
    {
        let result = this.keyIterableIterator.next();
        let key = result.value||null;
        this.state.value = [key, this.source.get(key)||null];
        this.state.done = result.done||false;
    } else
    {
        if (this.generationIterator)
        {
            var result = this.generationIterator.next();
            this.state.value = result.value;
            this.state.done = result.done;
        } else
        {
            let key = this.keys[++this.curIndex];
            this.state.value = [key, this.source[key]||null];
            this.state.done = this.keys.length <= this.curIndex;
        }
    }
    return this.state;
}

var _generation = function*(obj) {
    for (let k in obj)
        yield [k, obj[k]];
}

var _reset = function() {
    if (this.nestedEnumerator)
        this.nestedEnumerator.reset();
    else
    {
        if (this.sourceType == "Array")
            this.curIndex = -1;
        else if (this.sourceType == "Map")
            this.keyIterableIterator = this.keyIterableIterator[Symbol.iterator]();
        else
            this.curIndex = -1;
    }
}

var _nextWithNested = function() {
    let enumerator = <any>this.state.nestedEnumerator;
    enumerator.next();
    if (enumerator.state.done)
    {
        this.state.value = null;
        this.state.done = true;
    } else
    {
        this.state.value = enumerator.state.value;
        this.state.done = false;
    }
    return this.state;
}

var _nextWhere = function(handle: (elem) => boolean) {
    let state = <any>this.state;
    while (!state.done)
    {
        _nextWithNested.call(this);
        if (state.done || handle(state.value))
            break;
    }
    return state;
}

var _nextSelect = function(handle: (elem) => any) {
    let state = <any>this.state;
    _nextWithNested.call(this);
    state.value = state.value?handle(state.value):null;
    return state;
}

var _where = function<TReturn>(handle: (elem: TReturn) => boolean) {
    let _this = <IEnumerable<TReturn>>this;
    return __makeEnumerable(_this, true, _nextWhere, handle);
}

var _select = function<TReturn, TReturn2>(handle: (elem: TReturn) => TReturn2) {
    let _this = <IEnumerable<TReturn>>this;
    return __makeEnumerable(_this, true, _nextSelect, handle);
}

var _count = function<TReturn>() {
    let _this = <IEnumerable<TReturn>>this;
    let count = 0;
    for (let v of _this)
        ++count;
    return count;
}

var _toArray = function<TReturn>() {
    let _this = <IEnumerable<TReturn>>this;
    let ret = [];
    for (let v of _this)
        ret.push(v);
    return ret;
}

var _orderBy = function<TReturn, TKey extends number>(handle: (elem: TReturn) => TKey) {
    let _this = <IEnumerable<TReturn>>this;
    let _newSource: TReturn[] = [];
    for (let elem of _this)
        _newSource.push(elem);
    _newSource.sort((a, b) => handle(a) - handle(b));
    return makeEnumerable(_newSource);
}

var _orderByDescending = function<TReturn, TKey extends number>(handle: (elem: TReturn) => TKey) {
    let _this = <IEnumerable<TReturn>>this;
    let _newSource: TReturn[] = [];
    for (let elem of _this)
        _newSource.push(elem);
    _newSource.sort((a, b) => handle(b) - handle(a));
    return makeEnumerable(_newSource);
}

var _forEach = function<TReturn>(handle: (elem: any) => TReturn) {
    let _this = <IEnumerable<TReturn>>this;
    for (let v of _this)
        handle(v);
}

var _getEnumerator = function<TReturn>() {
    return <IEnumerator<TReturn>>this[Symbol.iterator]();
}

var _debug = function() {
    for (let v of this)
        console.log(v);
}

var _enumerableProto = {
    where: _where,
    select: _select,
    count: _count,
    toArray: _toArray,
    orderby: _orderBy,
    orderbyDescending: _orderByDescending,
    getEnumerator: _getEnumerator,
    forEach: _forEach,
    debug: _debug
}

var __makeEnumerable = function<TSource, TReturn>(
        _source: TSource,
        nested: boolean,
        _nextFunc: (handle?: (elem: TReturn) => any) => IEnumeratorState<TReturn>,
        _nextHandle?: (elem: TReturn) => any
    ): IEnumerable<TReturn> {
    let enumerable = Object.create(_enumerableProto, {
        [Symbol.iterator]: {
            value: function() {
                let ret = Object.create(null);
                let state: IEnumeratorState<TReturn> = {
                    value: null,
                    done: false,
                    nestedEnumerator: nested?(<any>_source).getEnumerator():null
                }
                if (!nested)
                {
                    ret.source = (<any>enumerable)._source;
                    if (ret.source instanceof Array)
                    {
                        ret.sourceType = "Array";
                        ret.curIndex = -1;
                        ret.keyIterableIterator = null;
                        ret.generationIterator = null;
                        ret.keys = null;
                    } else if (ret.source instanceof Map)
                    {
                        ret.sourceType = "Map";
                        ret.curIndex = null;
                        ret.keyIterableIterator = (<Map<any, TReturn>>ret.source).keys();
                        ret.generationIterator = null;
                        ret.keys = null;
                    } else
                    {
                        ret.sourceType = "CustomObj";
                        ret.curIndex = -1;
                        ret.keyIterableIterator = null;
                        try
                        {
                            ret.generationIterator = _generation(ret.source);
                        } catch (e)
                        {
                            ret.keys = Object.keys(ret.source);
                            ret.generationIterator = null;
                        }
                    }
                }
                ret.state = state;
                if (!ret.next)
                {
                    if (_nextHandle)
                        ret.next = _nextFunc.bind(ret, _nextHandle);
                    else
                        ret.next = _nextFunc;
                }
                ret.reset = _reset;
                return ret;
            }
        },
    });
    if (!nested)
        enumerable._source = _source;

    return enumerable;
}

function makeEnumerable<TElem>(source: Array<TElem>): IEnumerable<TElem>
function makeEnumerable<TKey, TElem>(source: Map<TKey, TElem>): IEnumerable<[TKey, TElem]>
function makeEnumerable<TElem>(source: {[key: string]: TElem}): IEnumerable<[string, TElem]>
function makeEnumerable(source): IEnumerable<any>
{
    return __makeEnumerable(source, false, _originNext, null);
}

export default makeEnumerable;