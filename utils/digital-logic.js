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
function AND(){
	this.operands = arguments;
}
AND.prototype.TYPE = "OPERATOR";
AND.prototype.NAME = "AND";

AND.prototype.toString = function(){
	return $.map(this.operands, function(evaled, index){
		return evaled.toString();
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

function OR(){
	this.operands = arguments;
}

OR.prototype.TYPE = "OPERATOR";
OR.prototype.NAME = "OR";

OR.prototype.toString = function(){
	return "(" + $.map(this.operands, function(evaled, index){
		return evaled.toString();
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

NOT.prototype.toString = function(){
	return "~(" + this.operand.toString() + ")";
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
	toString: function(){ return "TRUE"; },
	eval: function() { return this; }
};

var FALSE = {
	TYPE: "LITERAL",
	NAME: "FALSE",
	toString: function(){ return "FALSE"; },
	eval: function() { return this; }
};

/***************
 ** VARIABLES ** 
 ***************/

function VARIABLE(name, expr){
	this.NAME = name;
	this.value = expr; // note: it is OK if this remains undefined!
}
VARIABLE.prototype.TYPE = "VARIABLE";
VARIABLE.prototype.toString = function(){
	return this.NAME;
};
VARIABLE.prototype.eval = function(){
	if(typeof this.value === "undefined") return this;
	else return this.value.eval();
};

/*************
 ** PARSING ** 
 *************/

function ParserContext(str){
 	this.str = str;
 	this.ind = 0;
}
ParserContext.prototype.set = function(i){
	this.ind = i;
};
ParserContext.prototype.next = function(){
	return this.str.charAt(this.ind++);
};
ParserContext.prototype.test = function(word){
	if(this.str.substr(this.ind, word.length) === word){
		this.ind += word.length;
		return true;
	} else{
		return false;
	}
}
ParserContext.prototype.match = function(word){
	if(this.test(word)) return true;
	else{
		console.error("Parse Error: expected '"+word+"' at index "+this.ind);
		return false;
	}
};
ParserContext.prototype.isNum = function(){
	var c = this.str.charAt(this.ind);
	return '0' < c && c < '9';
};
ParserContext.prototype.isAlpha = function(){
	var c = this.str.charAt(this.ind);
	return ('a' < c && c < 'z') ||
		('A' < c && c < 'Z') ||
		c == '_';
};
// take whitespace
ParserContext.prototype.s = function(){
	while(this.test(" ") || this.test("\t") || this.test("\n"));
};
// get word (one or more alphanumeric or '_')
ParserContext.prototype.w = function(){
	var w = "";
	while(this.isAlpha()) w += this.next();
	return w;
};

var ExpressionParser = {

	// THE TOP LEVEL
	// parse full expression
	expression: function(ctx){
		// this line defines the order of operations
		return this.parens(ctx) || 
			this.not(ctx) || 
			this.and(ctx) || 
			this.or(ctx) || 
			this.lit(ctx) || 
			this.vari(ctx);
	},

	// anything not an operator ("unary", if you will)
	term: function(ctx){
		return this.parens(ctx) || 
			this.lit(ctx) || 
			this.vari(ctx);
	},

	// parse parenthesized expression and return it, or undefined if not there
	parens: function(ctx){
		ctx.s();
		var start = ctx.ind;
		if(ctx.test("(")){
			var content = expression(ctx);
			if(ctx.match(")")) return content;
		}
		// failed.. reset
		ctx.set(start);
		return undefined;
	},

	lit: function(ctx){
		ctx.s();
		if(ctx.test("TRUE") || ctx.test("T"))
			return TRUE;
		else if(ctx.test("FALSE") || ctx.test("F"))
			return FALSE;
		return undefined;
	},

	// parse a variable name
	// variables are required to be a single capital letter. T and F are reserved.
	vari: function(ctx){
		ctx.s();
		var start = ctx.ind;
		var ch = ctx.next();
		if('A' < ch && ch < 'Z' && ch != 'T' && ch != 'F')
			return new VARIABLE(ch);
		ctx.set(start);
		return undefined;
	},

	not: function(ctx){
		var start = ctx.ind;
		ctx.s();
		if(ctx.test("~") || ctx.test("!") || ctx.test("-")){
			var content = this.term(ctx);
			if(content) return new NOT(content);
		}
		// failed.. reset
		ctx.set(start);
		return undefined;
	},

	and: function(ctx){
		var start = ctx.ind;
		var lhs = this.term(ctx);
		if(lhs){
			ctx.s();
			if(ctx.test("x") || ctx.test("AND") || ctx.test("A") || ctx.test("*")){
				ctx.s();
				var rhs = this.term(ctx) || this.not(ctx);
				if(rhs) return new AND(lhs, rhs);
			}
		}
		// failed.. reset
		ctx.set(start);
		return undefined;
	},

	or: function(ctx){
		var start = ctx.ind;
		var lhs = this.term(ctx);
		if(lhs){
			ctx.s();
			if(ctx.test("+") || ctx.test("OR") || ctx.test("O")){
				ctx.s();
				var rhs = this.expression(ctx);
				if(rhs) return new OR(lhs, rhs);
			}
		}
		// failed.. reset
		ctx.set(start);
		return undefined;
	},

	// The function called externally
	parse: function(str){
		var ctx = new ParserContext(str);
		return this.expression(ctx);
	}
};

// TESTS
(function(ctx){
	x = new VARIABLE("x");
	y = new VARIABLE("y");
	z = new AND(x, y);
	w = new NOT(z);

	console.log(w.toString());
	
	console.log(w.eval().toString());

	x.value = TRUE;
	//y.value = FALSE;
	console.log(w.eval().toString());
})();

$(document).ready(function(){
	$("#go_btn").eq(0).click(function(e){
		console.log("PARSING: '"+$("#expr_in").eq(0).val()+"'");
		var expr;
		try{
			expr = ExpressionParser.parse($("#expr_in").eq(0).val());
		} catch(e){
			$("#expr_out").eq(0).text(""+e);
		}
		if(expr){
			$("#expr_out").eq(0).text(expr.toString());
			$("#eval_out").eq(0).text(expr.eval().toString());
		} else{
			$("#expr_out").eq(0).text("errors of some sort");
		}
	});
});