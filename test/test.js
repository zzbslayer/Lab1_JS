/**
 * Created by Zzbslayer on 2017/7/29.
 */
var assert = require('assert');

function MyArray() {
    this.array = [];
}

MyArray.prototype.add = function(data) {
    this.array.push(data);
};
MyArray.prototype.remove = function(data) {
    this.array = this.array.filter(function(current) {
        return current !== data;
    });
};
MyArray.prototype.search = function(data) {
    var foundIndex = this.array.indexOf(data);
    if(~foundIndex) {
        return foundIndex;
    }

    return null;
};
MyArray.prototype.getAtIndex = function(index) {
    return this.array[index];
};
MyArray.prototype.length = function() {
    return this.array.length;
};
MyArray.prototype.print = function() {
    console.log(this.array.join(' '));
};

var_table = new MyArray();

function IsAlpha(cCheck) {
    return ((('a'<=cCheck) && (cCheck<='z')) || (('A'<=cCheck) && (cCheck<='Z')))
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const number = 'n';
const print = ';';
const result = '=';
const name = 'a';
const mylet = 'L';
const declkey = "let";

function getchar(str){
    if (str.length!=0)
        return str.charAt(0);
    return "";
}

function putback(ch,str){
    str = ch + str;
    return str;
}

function IsInt(x) {
    var y = parseInt(x, 10);
    return !isNaN(y) && x == y && x.toString() == y.toString();
}
function error(str){
    throw str;
}

function Variable(n,v){
    this.name = n;
    this.value = v;
}

function Token(){
    this.kind = null;
    this.name = null;
    this.value = null;
}

function Token_stream(){
    this.full = false;
    this.buffer = null;
    this.sin = "";
    this.NumOfBracket = 0;

}

Token_stream.prototype.get = function(){
    if (this.full) {
        this.full = false;
        return this.buffer;
    }
    var ch = " ";
    while (ch==" "){
        ch = getchar(this.sin);
        this.sin = this.sin.substr(1);
    }
    token = new Token();
    switch (ch){
        case '(':
        {
            this.NumOfBracket++;
            token.kind = ch;
            return token;
        }
        case ')':
        {
            this.NumOfBracket--;
            token.kind = ch;
            return token;
        }
        case print:
        case'+':
        case'-':
        case'*':
        case'/':
        case'%':
        case'=':
        case'M':
        case'^':
        case'!':
        {
            token.kind = ch;
            return token;
        }
        case'.':
        case'0':
        case'1':
        case'2':
        case'3':
        case'4':
        case'5':
        case'6':
        case'7':
        case'8':
        case'9':
        {
            var str = "";
            while (this.sin.length>0 && (isNumber(ch)||ch==".")){
                str += ch;
                ch = getchar(this.sin);
                this.sin = this.sin.substr(1);
            }
            this.sin = putback(ch,this.sin);
            if (isNumber(str)){
                token.kind = number;
                token.value = parseFloat(str);
                return token;
            }
            error("Too much '.'");
        }
        default:
            if (IsAlpha(ch)) {
                var s="";
                s += ch;
                ch = getchar(this.sin);
                while (IsAlpha(ch)) {
                    s += ch;
                    this.sin = this.sin.substr(1);
                    ch = getchar(this.sin) ;
                }
                if (s == declkey) {
                    token.kind = mylet;
                    token.value = 0;
                    return token;
                }
                token.kind = name;
                token.name = s;
                return token;
            }
    }
    error("Bad Token");
}

Token_stream.prototype.putback = function(t){
    if (this.full){
        error("putback() into a full buffer");
    }
    this.buffer = t;
    this.full = true;
}
Token_stream.prototype.clear = function(){
    this.full = false;
    this.buffer = null;
    this.sin = "";
    this.NumOfBracket = 0;
}
Token_stream.prototype.SinUpdate = function(s){
    this.sin = s;
}

ts = new Token_stream();

function factorial(n){
    if (n<0||!IsInt(n))
        return -1;
    if (n==0)
        return 1;
    return n * factorial(n-1);
}

function double_factorial(n){
    if (n<0||!IsInt(n))
        return -1;
    if (n==0||n==1)
        return 1;
    return n*double_factorial(n-2);
}

function judge_factorial(left){
    var t2 = ts.get();
    if (t2.kind == '!'){
        if ((!IsInt(left))||left<0)
            error("Integer Error");
        var t3 = ts.get();
        if (t3.kind=='!'){
            var t4 = ts.get();
            if (t4.kind=='!')
                error("Too many '!'");
            ts.putback(t4);
            return double_factorial(left);
        }
        ts.putback(t3);
        return factorial(left);
    }
    ts.putback(t2);
    return left;
}

function primary(){
    var t= ts.get();
    if (t.kind=='.')
        error("Too many '.'");
    switch(t.kind){
        case '(':
        {
            var d = expression();
            t = ts.get();
            if (t.kind!=')')
                error("')'expected");
            return judge_factorial(d);
        }
        case number:
            return judge_factorial(t.value)
        case '+':
            return primary();
        case '-':
            return -primary();
        case name:
            return judge_factorial(get_value(t.name));
        default:
            ts.putback(t);
            error("Primary expected");
    }
}

function junior(){
    var left = primary();
    var t = ts.get();
    while(true){
        if (t.kind=="^"){
            var right = primary();
            left = Math.pow(left,right);
            t=ts.get();
            continue;
        }
        else{
            ts.putback(t);
            return left;
        }
    }
}

function term(){
    var left = junior();
    var t = ts.get();
    while (true){
        switch(t.kind){
            case'*':
            {
                left*=junior();
                t=ts.get();
                break;
            }
            case'/':
            {
                var temp = junior();
                if (Math.abs(temp)<0.00001)
                    error("Divided by 0");
                left/=temp;
                t=ts.get();
                break;
            }
            case'%':
            {
                var right = junior();
                if (!IsInt(left)||(!IsInt(right)))
                    error("Integer Error");
                if (right ==0)
                    error("Divided by 0");
                left = left % right;
                t=ts.get();
                break;
            }
            default:
                ts.putback(t);
                return left;
        }
    }
}
function expression() {
    var left = term();
    var t = ts.get();
    while (true) {
        switch (t.kind) {
            case'+': {
                left += term();
                t = ts.get();
                break;
            }
            case'-': {
                left -= term();
                t = ts.get();
                break;
            }
            case'M': {
                t = ts.get();
                if (t.kind != ':')
                    error("'M' should be at the end of the expression");
                if (is_declared("R"))
                    set_value("R",left);
                else
                    define_name("R",left);
                break;
            }
            default:
                ts.putback(t);
                return left;
        }
    }
}

function declaration(){
    var t = ts.get();
    if(t.kind!=name)
        error("Name expected in declaration");
    var var_name = t.name;
    var t2 = ts.get();
    if (t2.kind!='=')
        error("'=' missing in declaration of"+var_name);
    var d = expression();
    return define_name(var_name,d);
}

function statement(){
    var t = ts.get();
    switch(t.kind){
        case mylet:
            return declaration();
        case name:{
            var t2 = ts.get();

            /* The following is the inplemention of Assignment */

            if(t2.kind == '='){
                if(is_declared(t.name)){
                    var d = expression();
                    set_value(t.name,d);
                    return d;
                }
                error(t.name+" hasn't been declared");
            }
            ts.sin = putback(t2.kind,ts.sin);
            ts.putback(t);
            return expression();
        }
        default:
            ts.putback(t);
            return expression();
    }
}

function get_value(s){
    for(var i=0;i<var_table.length();i++){
        if (var_table.getAtIndex(i).name==s)
            return var_table.getAtIndex(i).value;
    }
}

function set_value(s,d){
    for(var i=0;i<var_table.length();i++){
        if (var_table.getAtIndex(i).name==s){
            var_table.getAtIndex(i).value=d;
            return;
        }
        error("Set undefined variable:"+s);
    }
}

function is_declared(v){
    for(var i=0;i<var_table.length();i++){
        if (var_table.getAtIndex(i).name==v)
            return true;
    }
    return false;
}

function define_name(v,val){
    if(is_declared(v))
        error(v+" declared twice");
    new_var = new Variable(v,val);
    var_table.add(new_var);
    return val;
}

function calculate(){
    try{
        var input = document.getElementById("input").value +';';
        ts.clear();
        ts.SinUpdate(input);
        var t = ts.get();
        while(t.kind==print)
            t=ts.get();
        ts.putback(t);
        var result = statement();
        if(ts.NumOfBracket<0)
            error("'('expected");
        else if(ts.NumOfBracket>0)
            error("')'expected");
        document.getElementById("output").innerHTML= "result:"+result;
    }
    catch(exception){
        document.getElementById("output").innerHTML="result:"+exception.toString();
    }
}

describe('IsAlpha(char)', function() {
    it('should return true when the value is an alpha', function() {
        assert.equal(true, IsAlpha('a'));
        assert.equal(true, IsAlpha('z'));
        assert.equal(true, IsAlpha('D'));
        assert.equal(true, IsAlpha('P'));
        assert.equal(true, IsAlpha("dsfwea"));
    });
});

describe('IsAlpha(char)', function() {
    it('should return false when the value isn\'t an alpha', function() {
        assert.equal(false, IsAlpha(1));
        assert.equal(false, IsAlpha('!'));
        assert.equal(false, IsAlpha(''));
        assert.equal(false, IsAlpha('\n'));
        assert.equal(false, IsAlpha(132141908));
    });
});

describe('IsNumber(str)',function () {
    it('should return true when the value is a number',function() {
        assert.equal(true,isNumber(-4));
        assert.equal(true,isNumber("9"));
        assert.equal(true,isNumber(10.4));
        assert.equal(true,isNumber("-9.89"));
    });
});

describe('IsNumber(str)',function () {
    it('should return false when the value isn\'t a number',function() {
        assert.equal(false,isNumber("12faw#"));
        assert.equal(false,isNumber(9+"f1"));
        assert.equal(false,isNumber("0.12.41"));
    });
});

describe('getchar()',function () {
    it('should return the first character of the string',function() {
        assert.equal('v',getchar("value"));
        assert.equal(',',getchar(",fawe123#"));
        assert.equal("",getchar(""));
    });
});

describe('putback(ch,str)',function () {
    it('should return ch+str',function () {
        assert.equal("abcdefg",putback("a","bcdefg"));
        assert.equal("1+4",putback("1","+4"));
    })
})

describe('IsInt()',function(){
    it('should return true when the value is an integer',function(){
        assert.equal(true,IsInt(10));
        assert.equal(true,IsInt(-402));
    })
})

describe('IsInt()',function(){
    it('should return false when the value isn\'t an integer',function(){
        assert.equal(false,IsInt(3.44));
        assert.equal(false,IsInt("few"));
        assert.equal(false,IsInt(true));
    })
})

describe('Token_stream', function() {
    describe('#get()', function () {
        it('should return a correct Token', function () {
            test = new Token_stream();

            test.sin = "let x=1.2;";
            var t = test.get();
            assert.equal(mylet, t.kind);

            t = test.get();
            assert.equal('x', t.name);
            assert.equal(name, t.kind);

            t = test.get();
            assert.equal('=', t.kind);

            t = test.get();
            assert.equal(number, t.kind);
            assert.equal(1.2, t.value);

            t = test.get();
            assert.equal(print, t.kind);

            test.clear();

            test.sin = "^*-/(321%x)+M!;";
            t = test.get();
            assert.equal('^', t.kind);

            t = test.get();
            assert.equal('*', t.kind);

            t = test.get();
            assert.equal('-', t.kind);

            t = test.get();
            assert.equal('/', t.kind);

            t = test.get();
            assert.equal('(', t.kind);

            t = test.get();
            assert.equal(number, t.kind);
            assert.equal(321, t.value);

            t = test.get();
            assert.equal('%', t.kind);

            t = test.get();
            assert.equal(name, t.kind);

            t = test.get();
            assert.equal(')', t.kind);

            t = test.get();
            assert.equal('+', t.kind);

            t = test.get();
            assert.equal('M', t.kind);

            t = test.get();
            assert.equal('!', t.kind);

            test.clear();
            test.sin = "#$%!$!$@few!R!@R;'`  d23!";
            try {
                t = test.get();
            }
            catch (exception) {
                assert.equal("Bad Token", exception);
            }
        });
    });

    describe('#putback(Token)',function(){
        it('should put the Token into buffer if not full and throw error if full',function(){
            test = new Token_stream();
            test.sin = "3*(1+4!);";
            var t = test.get();
            t = test.get();
            test.putback(t);
            try {
                test.putback(t);
            }
            catch (exception) {
                assert.equal("putback() into a full buffer", exception);
            }
            assert.equal(t, test.get());
        });
    });

    describe('#clear()',function(){
        it('should clear the Token_stream',function(){
            test = new Token_stream();
            test.sin = "3*(1+4!);";
            test.clear();
            assert.equal(null, test.buffer);
            assert.equal(false, test.full);
            assert.equal("", test.sin);
            assert.equal(0,test.NumOfBracket);
        });
    });
})

describe('factorial()',function(){
    it('should calculate factorial',function(){
        assert.equal(6,factorial(3));
        assert.equal(-1,factorial(-4));
        assert.equal(-1,factorial(1.4));
        assert.equal(-1,factorial("faweg"));
    });
});

describe('double_factorial()',function(){
    it('should calculate double factorial',function(){
        assert.equal(8,double_factorial(4));
        assert.equal(-1,double_factorial(-4));
        assert.equal(-1,double_factorial(1.4));
        assert.equal(-1,double_factorial("faweg"));
    });
});

describe('judge_factorial()',function(){
    it('should distinguish factorial, double_factorial and Error:Too much \'!\' and calculate',function(){
        ts.clear();
        ts.SinUpdate("!;");
        assert.equal(6,judge_factorial(3));
        ts.clear();
        ts.SinUpdate("!!;");
        assert.equal(8,judge_factorial(4));
        ts.clear();
        ts.SinUpdate("!!!;");
        try{
            judge_factorial(4);
        }
        catch(exception){
            assert.equal(exception,"Too many '!'");
        }
        ts.clear();
    });
});

describe('primary()',function(){
    it('should return primary',function(){
        ts.clear();
        ts.SinUpdate("13.4+1;");
        assert.equal(13.4,primary());
        ts.clear();
        ts.SinUpdate("-4!+1;");
        assert.equal(-24,primary());
        ts.clear();
        ts.SinUpdate("3+*1;");
        var t=ts.get();
        t=ts.get();
        try{
            primary();
        }
        catch(exception){
            assert.equal(exception,"Primary expected");
        }
        ts.clear();
    });
});

describe('junior()',function(){
    it('should return junior',function(){
        ts.clear();
        ts.SinUpdate("3^3;");
        assert.equal(27, junior());
        ts.clear();

        ts.SinUpdate("(4!!)^2;");
        assert.equal(64,junior());
        ts.clear();

        ts.SinUpdate("3^(3!)+1;");
        assert.equal(729,junior());
    });
});

describe('term()',function() {
    it('should return term', function () {
        ts.clear();
        ts.sin = "3*(1+4!);";
        assert.equal(75, term());
        ts.clear();

        ts.sin = "3*4+2!;";
        assert.equal(12, term());
        ts.clear();

        ts.sin = "(4!*2^(-1))+3%3;";
        assert.equal(12, term());
        ts.clear();

        ts.sin = "3/0;";
        try {
            term();
        }
        catch (exception) {
            assert.equal(exception, "Divided by 0");
        }
        ts.clear();

        ts.sin = "3%0;";
        try {
            term();
        }
        catch (exception) {
            assert.equal(exception, "Divided by 0");
        }
        ts.clear();

        ts.sin = "1.3!;";
        try {
            term();
        }
        catch (exception) {
            assert.equal(exception, "Integer Error");
        }
        ts.clear();
    });
});

describe('expression()',function(){
    it('should calculate the expression',function(){
        ts.clear();
        ts.sin = "11*12/(1+(1/2))+5*(6-4)*31;";
        assert.equal(398,expression());

        ts.clear();
        ts.sin = "1+++3;";
        assert.equal(4,expression());

        ts.clear();
        ts.sin = "1-+2;";
        assert.equal(-1,expression());

        ts.clear();
        ts.sin = "1+-3;";
        assert.equal(-2,expression());

        ts.clear();
        ts.sin = "4*-3;";
        assert.equal(-12,expression());

        ts.clear();
        ts.sin = "-2*-9++4*-2;";
        assert.equal(10,expression());

        ts.clear();
        ts.sin = "9+222%77*7*8-3*3*33%23;";
        assert.equal(3796,expression());
    });
});

describe('declaration()',function(){
    it('should declare a variable and return its value',function(){
        ts.clear();
        ts.sin = "x=1;";
        assert.equal(1,declaration());

        ts.clear();
        ts.sin = "x=1;";
        try{
            declaration();
        }
        catch(exception){
            assert(exception,"x declared twice");
        }

        ts.clear();
        ts.sin = "3=1;";
        try{
            declaration();
        }
        catch(exception){
            assert(exception,"Name expected in declaration");
        }

        ts.clear();
        ts.sin = "x 1;";
        try{
            declaration();
        }
        catch(exception){
            assert(exception,"'=' missing in declaration of x");
        }

        assert(1,get_value("x"));
    });
});

describe('statement()',function(){
    it('should distinguish a declaration between an expression and return the value',function(){
        ts.clear();
        ts.sin = "y=1;";
        try{
            statement();
        }
        catch(exceptioin){
            assert.equal(exceptioin,"y hasn't been declared");
        }

        ts.clear();
        ts.sin = "x=2;";
        assert.equal(2,statement());

        ts.clear();
        ts.sin = "9+222%77*7*8-3*3*33%23;";
        assert.equal(3796,statement());
        ts.clear();
    });
});
