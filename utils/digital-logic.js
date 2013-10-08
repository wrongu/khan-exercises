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

function isLiteral(obj){
	return obj.TYPE === "LITERAL";
}

function isNonLitereal(obj){
	return !isLiteral(obj);
}

function isOperator(obj){
	return obj.TYPE === "OPERATOR";
}

function isVariable(obj){
	return obj.TYPE == "VARIABLE";
}

function containsExpression(array, proto){
	for(var i=0; i < array.length; i++){
		if(array[i].NAME === proto.NAME) return true;
	}
	return false;
}

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
AND.prototype.TYPE = "OPERATOR";
AND.prototype.NAME = "AND";

AND.prototype.str = function(){
	return $.map(this.operands, function(evaled, index){
		return evaled.str();
	}).join(" AND ");
};

AND.prototype.eval = function(){
	var evaled = $.map(this.operands, function(evaled, ind){
		return evaled.eval() || evaled;
	});
	var literals = $.grep(evaled, isLiteral);
	var symbols = $.grep(evaled, isNonLitereal);
	// Basically, evaluation converts to literal TRUE/FALSE values
	//	whenever possible. Sometimes, due to variables being mixed
	//	into the expressions, non-literals ("symbols") still exist
	//	in the expression. If they do, we need to return the AND
	//	of whatever symbols remain.
	//	However! We also know that this is an AND expression. Any
	//	FALSE in the literals will falsify everything, regardless
	//	of what the symbols eventually turn out to be.
	if(containsExpression(literals, FALSE))
		return FALSE;
	else if(symbols.length > 1)
		return new AND(symbols);
	else if(symbols.length == 1)
		return symbols[0];
	else
		return TRUE;
}

/*********
 ** OR  **
 *********/

function OR(ops_array){
	this.operands = ops_array;
}

OR.prototype.TYPE = "OPERATOR";
OR.prototype.NAME = "OR";

OR.prototype.str = function(){
	return "(" + $.map(this.operands, function(evaled, index){
		return evaled.str();
	}).join(" OR ") + ")";
};

OR.prototype.eval = function(){
	var evaled = $.map(this.operands, function(evaled, ind){
		return evaled.eval() || evaled;
	});
	var literals = $.grep(evaled, isLiteral);
	var symbols = $.grep(evaled, isNonLitereal);
	// see the long comment in AND.prototype.eval
	if(containsExpression(literals, TRUE))
		return TRUE;
	else if(symbols.length > 1)
		return new OR(symbols);
	else if(symbols.length == 1)
		return symbols[0];
	else
		return FALSE;
};

/*********
 ** NOT **
 *********/

function NOT(op){
	this.operand = op;
}

NOT.prototype.TYPE = "OPERATOR";
NOT.prototype.NAME = "NOT";

NOT.prototype.str = function(){
	return "~(" + this.operand.str() + ")";
};

NOT.prototype.eval = function(){
	var evaled = this.operand.eval();
	if(evaled.TYPE == "LITERAL")
		return evaled === TRUE ? FALSE : TRUE;
	else
		return new NOT(evaled);
};

/**************
 ** LITERALS **
 **************/

var TRUE = {
	TYPE: "LITERAL",
	NAME: "TRUE",
	str: function(){ return "TRUE"; },
	eval: function() { return this; }
};

var FALSE = {
	TYPE: "LITERAL",
	NAME: "FALSE",
	str: function(){ return "FALSE"; },
	eval: function() { return this; }
};

/***************
 ** VARIABLES ** 
 ***************/

function VARIABLE(name, expr){
	this.name = name;
	this.value = expr; // note: it is OK if this remains undefined!
}
VARIABLE.prototype.TYPE = "VARIABLE";
VARIABLE.prototype.str = function(){
	return this.name;
};
VARIABLE.prototype.eval = function(){
	if(typeof this.value === "undefined") return this;
	else return this.value.eval();
};

// TESTS
(function(){
	x = new VARIABLE("x");
	y = new VARIABLE("y");
	z = new AND([x, y]);
	w = new NOT(z);

	console.log(w.str());
	
	console.log(w.eval().str());

	x.value = TRUE;
	//y.value = FALSE;
	console.log(w.eval().str());
})();