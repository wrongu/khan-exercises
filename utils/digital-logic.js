/*
 * Digital logic functions and utilities
 * 
 * written by Richard Lange
 * October 2013
 *
 * The core material to teach is boolean logic. This includes truth tables, karnaugh maps, and (eventually)
 * logic diagrams using gates. Concepts include DeMorgan's Law and boolean algebra.
 *
 * This curriculum leads nicely into digital electronics, with simple circuits like 7-segment displays.
 *
 * The core of these functions is a boolean expression. Literal values are True and False, or 1 and 0.
 *	Operations supported by this engine are AND, OR, NOT, NAND, NOR, XOR, and XNOR
 *
 */

var ExpressionError = function(message){
	this.message = message;
};
ExpressionError.prototype.name = "ExpressionError";

function AND(operands){
	if(this.eval_flag) throw new ExpressionError("Loop in logical expression");
	this.eval_flag = true;
	for (var i = 0; i < operands.length; i++) {
		if(!operands[i].evaluate()){
			return false;
		}
	};
	return true;
};

function OR(operands){
	if(this.eval_flag) throw new ExpressionError("Loop in logical expression");
	this.eval_flag = true;
	for (var i = 0; i < operands.length; i++) {
		if(operands[i].evaluate()){
			return true;
		}
	};
	return false;
};

function NOT(operands){
	if(operands.length > 1) throw new ExpressionError("NOT cannot evaluate multiple arguments");
	return !operands[0].evaluate();
};

function BooleanExpression(type, ops){
	this.operands = ops;
	this.operator = type;
	this.eval_flag = false;
};

BooleanExpression.prototype.evaluate = function(){
	switch(this.operator){
		case "": // literal value
		case "LITERAL":
			return this.operands;
			break;
		case "AND":
			return AND(this.operands);
			break;
		case "OR":
			return OR(this.operands);
			break;
		case "NOT":
			return NOT(this.operands);
			break;
	}
};

var x, y, z;

// TESTS
(function(){
	x = new BooleanExpression("", true);
	y = new BooleanExpression("", false);
	z = new BooleanExpression("AND", [x, y]);

	console.log(x);
	console.log(y);
	console.log(z);

	console.log(x.evaluate());
	console.log(y.evaluate());
	console.log(z.evaluate());
})();