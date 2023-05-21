// import { isBoolExp, isNumExp, isPrimOp, isStrExp, isVarDecl, isVarRef, isSetExp,
//     isAppExp, isDefineExp, isIfExp, isLetrecExp, isLetExp, isLitExp, isProcExp, isProgram,
//     parseL4, unparse, parseL4Exp, Exp, makeBoundExp, makeVarRef, isBoundExp } from '../src/L4/L4-ast';
// import { Result, bind, isOkT, makeOk, isFailure, isOk } from '../src/shared/result';
// import { T } from 'ramda';
// import exp from 'constants';

import { Sexp, Token } from "s-expression";
import { parse as parseSexp } from "../src/shared/parser";
import { Exp, isBoundExp, isTimeExp, makeBoundExp, makeVarDecl, makeVarRef, parseL4, parseL4Exp } from '../src/L4/L4-ast';
import { isEnv, makeExtEnv, applyEnv, theGlobalEnv, globalEnvAddBinding } from '../src/L4/L4-env-box';
import { CompoundSExp, makeClosure, makeCompoundSExp, makeEmptySExp, makeSymbolSExp } from '../src/L4/L4-value-box';
import { evalParse, evalProgram } from '../src/L4/L4-eval-box';
import { makeOk, bind, isFailure, isOkT, Result, isOk } from '../src/shared/result';
import { ifElse } from "ramda";

const p = (x: string): Result<Exp> => bind(parseSexp(x), parseL4Exp);

describe("HW3 bound AST", () => {

    it("Check if an expression is bound expression", () => {
        const boundExp = p("(bound? foo)");
        // console.log(`boundExp: ${JSON.stringify(boundExp)}`)
        expect(boundExp).toSatisfy(isOkT(isBoundExp));
    })

    it("Shouldn't parse bound expression without arguments", () => {
        const boundExp = p("(bound?)")
        expect(boundExp).toSatisfy(isFailure)
    })

    it("Shouldn't parse bound expression with more than one argument", () => {
        const boundExp = p("(bound? a b)")
        expect(boundExp).toSatisfy(isFailure)
    })
})

describe("HW3 time AST", () => {

    it("Time expression with atomic expression", () => {
        const timeExp = p("(time 1)");
        expect(timeExp).toSatisfy(isOkT(isTimeExp));
    })

    it("Time expression with composite expression", () => {
        const timeExp = p("(time (lambda (x) x))");
        expect(timeExp).toSatisfy(isOkT(isTimeExp));
    })

    it("Time expression without arguments", () => {
        const timeExp = p("(time)")
        expect(timeExp).toSatisfy(isFailure)
    })

    it("Time expression with more than 1 argument", () => {
        const timeExp = p("(time a b c)")
        expect(timeExp).toSatisfy(isFailure)
    })})

describe('HW3 bound eval', () => {

    it("Variable is bound", () => {
        const program = `
        (L4
            (define foo 1)
            (bound? foo)
        )`
        const parsedProgramm = parseL4(program)
        // console.log(`boundExp: ${JSON.stringify(parsedProgramm)}`)
        expect(bind(parsedProgramm, evalProgram)).toEqual(makeOk(true));
    });

    it("Variable is NOT bound", () => {
        const program = `
        (L4
            (bound? foo1)
        )`
        const parsedProgramm = parseL4(program)
        // console.log(`boundExp: ${JSON.stringify(parsedProgramm)}`)
        expect(bind(parsedProgramm, evalProgram)).toEqual(makeOk(false));
    });

    it("Variable is NOT bound", () => {
        expect(evalParse("(bound? goo)")).toEqual(makeOk(false));
    });

    describe('HW time eval', () => {
        it("Fib calc time", () => {

            const program = `
            (L4
                (define fib
                    (lambda (n)
                      (if (= n 0) 1
                          (if (= n 1) 1
                              (+ (fib (- n 2)) (fib (- n 1)))))))
                (time (fib 20))
            )`
            const parsedProgramm = parseL4(program)
            let retValue = bind(parsedProgramm, evalProgram)

            expect(retValue).toSatisfy(isOk)

            if (isOk(retValue)) {
                let val = (retValue.value as CompoundSExp).val1
                let timeInMs = (retValue.value as CompoundSExp).val2

                expect(val).toEqual(10946)
                expect(timeInMs).toBeGreaterThan(50)
            }

        });
    })
});
