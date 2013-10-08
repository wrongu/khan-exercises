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
 *	Operations supported by this engine are AND, OR, NOT, NAND, NOR, XOR, and XNOR.
 *
 */

var ExpressionError = function(message){
	this.message = message;
};
ExpressionError.prototype.name = "ExpressionError";

/*********
 ** AND **
 *********/
function AND(ops_array){
	this.operands = ops_array;
}

AND.prototype.str = function(){
	return $.map(this.operands, function(elem, index){
		return elem.str();
	}).join(" AND ");
};

AND.prototype.eval = function(){
	for (var i = 0; i < this.operands.length; i++) {
		if(!this.operands[i].eval()){
			return false;
		}
	};
	return true;
};

/*********
 ** OR  **
 *********/

function OR(ops_array){
	this.operands = ops_array;
}

OR.prototype.str = function(){
	return "(" + $.map(this.operands, function(elem, index){
		return elem.str();
	}).join(" OR ") + ")";
};

OR.prototype.eval = function(){
	for (var i = 0; i < this.operands.length; i++) {
		if(this.operands[i].eval()){
			return true;
		}
	};
	return false;
};

/*********
 ** NOT **
 *********/

function NOT(op){
	this.operands = op;
}

NOT.prototype.str = function(){
	return "(" + op.str() + ")'";
};

NOT.prototype.eval = function(){
	return !op.eval();
};

/**************
 ** LITERALS **
 **************/

var TRUE = {};
TRUE.str = function(){
	return "TRUE";
};
TRUE.eval = function(){
	return true;
};

var FALSE = {};
FALSE.str = function(){
	return "FALSE";
};
FALSE.eval = function(){
	return false;
};

/***************
 ** VARIABLES ** 
 ***************/

function VARIABLE(name, expr){
	this.name = name;
	this.value = expr; // note: it is OK if this remains undefined!
}
VARIABLE.prototype.str = function(){
	return this.name;
};
VARIABLE.prototype.eval = function(){
	if(typeof this.expr === "undefined") return undefined;
	else return this.expr.eval();
};

// TESTS
(function(){
	x = new VARIABLE("x");
	y = new VARIABLE("y");
	z = new AND([x, y]);

	console.log(z.str());
	
	console.log(z.eval());

	x.value = TRUE;
	y.value = TRUE;
	console.log(z.eval());
})();