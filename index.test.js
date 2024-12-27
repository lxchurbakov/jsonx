import { digest } from "./index";

describe('pass-through', () => {
    it('works', () => {
        expect(digest({}, { a: 1 })).toStrictEqual({ a: 1 });
    });
});

describe('refs', () => {
    it('work', () => {
        expect(digest({
            test: 'test'
        }, { 
            a: ['@ref', 'test'] 
        })).toStrictEqual({ 
            a: 'test' 
        });
    });

    it('are callable', () => {
        expect(digest({
            a: 2,
            test: ['@ref', 'a'],
        }, { 
            a: ['@test'] 
        })).toStrictEqual({ 
            a: 2
        });
    });
});

describe('callables', () => {
    it('work', () => {
        expect(digest({ 
            fib: ['@?', ['@<', ['@ref', 0], 2], 1, 
                ['@+',
                    ['@fib', ['@+', ['@ref', 0], -1]],
                    ['@fib', ['@+', ['@ref', 0], -2]]
                ]
            ]
        }, { value: ['@fib', 7] })).toStrictEqual({ value: 21 })
    });
});     
