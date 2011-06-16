module("expressions");

(function(){

var expr = KhanUtil.expr;

test( "Expression formatter", function() {
	equals( expr([ "+", 1, 2 ]), "1+2", "1 + 2" );
	equals( expr([ "+", "elephant", "potato" ]), "elephant+potato", "random strings" );

	equals( expr([ "*", "x", "y" ]), "xy", "x * y" );
	equals( expr([ "*", 2, 4 ]), "(2)(4)", "2 * 4" );
	equals( expr([ "*", 2, 4, "x" ]), "(2)(4)(x)", "2 * 4 * x" );

	equals( expr([ "/", 5, 3 ]), "5/3", "5 / 3" );

	equals( expr([ "^", "x", 2 ]), "x^{2}", "x^2" );
	equals( expr([ "^", ["*", "x", "y"], 2 ]), "(xy)^{2}", "(xy)^2" );
	equals( expr([ "^", ["*", "x", "y"], ["+", 2, 3] ]), "(xy)^{2+3}", "(xy)^{2+3}" );

	equals( expr([ "sin", "x" ]), "\\sin{x}", "sin x" );
	equals( expr([ "sin", ["*", "x", "y"] ]), "\\sin{(xy)}", "sin xy" );
	equals( expr([ "sin", ["+", "x", "y"] ]), "\\sin{(x+y)}", "sin(x + y)" );

	equals( expr([ "*", 2, ["sqrt", 5] ]), "2\\sqrt{5}", "2 sqrt(5)" );
	equals( expr([ "*", ["+", "w", "x"], "y" ]), "(w+x)(y)", "(w + x) * y");

	equals( expr([ "+-", "x" ]), "\\pm x", "+- x" );
	equals( expr([ "+-", "x", "y" ]), "x \\pm y", "x +- y" );
	equals( expr([ "+-", ["+", "x", "y"] ]), "\\pm (x+y)", "x +- y" );

	equals( expr([ "+", ["*", 2, ["^", 3, 2]], ["*", -3, 3], 4 ]), "2(3^{2})+(-3)(3)+4", "issue 90" );
	equals( expr([ "+", ["*", 2, ["^", 3, "x"]], ["*", -3, "x"], 4 ]), "2(3^{x})-3x+4", "issue 90" );

	equals( expr([ "*", -2, ["^", "x", 2]]), "-2x^{2}", "polynomial term" );
});

test( "Expression evaluator", function() {
	equals( expr([ "+", 2, 4 ], true ), 6, "2 + 4" );
	equals( expr([ "*", 2, 4 ], true ), 8, "2 * 4" );
	equals( expr([ "-", 2, 4 ], true ), -2, "2 - 4" );
	equals( expr([ "/", 2, 4 ], true ), 0.5, "2 / 4" );
	equals( expr([ "^", 2, 4 ], true ), 16, "2 ^ 4" );
	equals( expr([ "frac", 2, 4 ], true ), 0.5, "2 `frac` 4" );
	equals( expr([ "sqrt", 65536 ], true ), 256, "sqrt 65536" );
	equals( expr([ "+", ["*", 2, 4], 6 ], true ), 14, "2 * 4 + 6" );
});

})();
