function abs(x) {
    return (x < 0 ? -x : x);
}

function maxInArray(arr) {
    let m = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > m) {
            m = arr[i];
        }
    }
    return m;
}

function sqrtCustom(n) {
    if (n < 0) {
        throw new Error("Cannot compute square root of negative number");
    }
    if (n === 0) return 0;
    let x = n;
    let epsilon = 1e-10;
    let last;
    do {
        last = x;
        x = (x + n / x) / 2;
    } while (abs(x - last) > epsilon);
    return x;
}

function parseSide(side) {
    const cleanSide = side.replace(/\s/g, '');
    const termRegex = /([+-]?[\d.]+)\*X\^(\d+)/g;
    const coeffs = {};
    let match;
    while ((match = termRegex.exec(cleanSide)) !== null) {
        const coef = parseFloat(match[1]);
        const exp = parseInt(match[2], 10);
        coeffs[exp] = (coeffs[exp] || 0) + coef;
    }
    return coeffs;
}

function getReducedForm(leftCoeffs, rightCoeffs) {
    const reduced = {};
    const exponents = new Set([
        ...Object.keys(leftCoeffs).map(Number),
        ...Object.keys(rightCoeffs).map(Number)
    ]);
    exponents.forEach(exp => {
        const leftVal = leftCoeffs[exp] || 0;
        const rightVal = rightCoeffs[exp] || 0;
        const net = leftVal - rightVal;
        reduced[exp] = net;
    });
    return reduced;
}

function buildReducedString(reduced) {
    const exponents = Object.keys(reduced)
        .map(Number)
        .sort((a, b) => a - b);
    let result = '';
    exponents.forEach((exp, idx) => {
        const coef = reduced[exp];
        if (coef === 0 && exponents.length > 1) return;
        let termStr = '';
        if (idx === 0) {
            termStr += (coef < 0 ? '-' : '');
        } else {
            termStr += (coef < 0 ? ' - ' : ' + ');
        }
        termStr += abs(coef) + " * X^" + exp;
        result += termStr;
    });
    return result || "0";
}

function getDegree(reduced) {
    const exponents = Object.keys(reduced).map(Number);
    const nonZeroExps = exponents.filter(exp => abs(reduced[exp]) > 1e-8);
    return nonZeroExps.length > 0 ? maxInArray(nonZeroExps) : 0;
}

function solveLinear(a, b) {
    if (abs(a) < 1e-8) return null;
    return -b / a;
}

function solveQuadratic(a, b, c) {
    const discriminant = b * b - 4 * a * c;
    if (discriminant > 1e-8) {
        const sqrtD = sqrtCustom(discriminant);
        const x1 = (-b + sqrtD) / (2 * a);
        const x2 = (-b - sqrtD) / (2 * a);
        return { discriminant, type: 'positive', solutions: [x1, x2] };
    } else if (abs(discriminant) < 1e-8) {
        const x = -b / (2 * a);
        return { discriminant, type: 'zero', solutions: [x] };
    } else {
        const sqrtD = sqrtCustom(-discriminant);
        const realPart = -b / (2 * a);
        const imagPart = sqrtD / (2 * a);
        return { discriminant, type: 'negative', solutions: [`${realPart} + ${imagPart}i`, `${realPart} - ${imagPart}i`] };
    }
}

function solvePolynomial(equation) {
    const sides = equation.split('=');
    if (sides.length !== 2) {
        console.error("Invalid equation format. Must contain one '=' sign.");
        return;
    }
    const leftCoeffs = parseSide(sides[0]);
    const rightCoeffs = parseSide(sides[1]);
    const reduced = getReducedForm(leftCoeffs, rightCoeffs);
    const reducedStr = buildReducedString(reduced) + " = 0";
    const degree = getDegree(reduced);

    console.log("Reduced form:", reducedStr);
    console.log("Polynomial degree:", degree);

    if (degree > 2) {
        console.log("The polynomial degree is greater than 2.");
        return;
    }

    if (degree === 0) {
        const c = reduced[0] || 0;
        if (abs(c) < 1e-8) {
            console.log("All real numbers are solutions.");
        } else {
            console.log("No solution.");
        }
    } else if (degree === 1) {
        const a = reduced[1] || 0;
        const b = reduced[0] || 0;
        const sol = solveLinear(a, b);
        if (sol === null) {
            console.log("No solution.");
        } else {
            console.log("The solution is:");
            console.log(sol);
        }
    } else if (degree === 2) {
        const a = reduced[2] || 0;
        const b = reduced[1] || 0;
        const c = reduced[0] || 0;
        const result = solveQuadratic(a, b, c);
        if (result.type === 'positive') {
            console.log("Discriminant is strictly positive, the two solutions are:");
            result.solutions.forEach(sol => console.log(sol));
        } else if (result.type === 'zero') {
            console.log("Discriminant is zero, the solution is:");
            console.log(result.solutions[0]);
        } else {
            console.log("Discriminant is strictly negative, the two complex solutions are:");
            result.solutions.forEach(sol => console.log(sol));
        }
    }
}

if (process.argv.length < 3) {
    console.error("Usage: node c_v1.js \"<equation>\"");
    process.exit(1);
}
const inputEquation = process.argv[2];
solvePolynomial(inputEquation);

