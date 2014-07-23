/*
jQuery class library
@auther Norimasa Ikeda
*/

(function ($){
    // private variable and functions
    var slice = Array.prototype.slice;
    function getNamedFunction(funcName){
        return (new Function(
            "return function " 
            + (funcName || "")
            + "(){return this.__init.apply(this, arguments);}"
        ))();
    }
    function isString(str){
        return typeof str == 'string' || str instanceof String;
    }
    function extendProp(){
        var args = slice.call(arguments, 0)
        console.log('#1', args)
        var deepCopy = typeof args[args.length - 1] === "boolean" ? args.pop() : false;
        var obj = args.shift()
        var prop = args.shift()
        console.log(args, obj, prop, deepCopy)
        for(var key in obj){
            if(key in prop){
                if(typeof obj[key] === "object" && deepCopy){
                    extendProp(obj[key], prop[key], deepCopy)
                }else{
                    obj[key] = prop[key]
                }
            }
        }
        if(args.length){
            args.shift(obj)
            args.shift(deepCopy)
            extendProp.apply(this, args)
        }
        return obj
    }


    $.extend({
        // Usage: jQuery.inherit(proto, [prop1, [prop2 ...]])
        inherit : (function (){
            if (typeof Object.create === 'function'){
                return function (proto){
                    var args = slice.call(arguments, 1);
                    return $.extend.apply($, [Object.create(proto)].concat(args));
                }
            }
            else{
                return function (proto){
                    var args = slice.call(arguments, 1), 
                        Temp = function () {};
                    Temp.prototype = proto;
                    return $.extend.apply($, [Temp()].concat(args));
                }
            }
        }()),
        // Usage: jQuery.inheritPrototype([funcName], proto, [prop1, [prop2 ...]])
        inheritPrototype : function (){
            var firstIsString = isString(arguments[0]),
                funcName = firstIsString ? arguments[0] : '',
                proto = arguments[firstIsString ? 1 : 0],
                args = slice.call(arguments, firstIsString ? 2 : 1),
                Constructor = getNamedFunction(funcName);
            Constructor.prototype = $.inherit.apply($, [proto].concat(args, [{
                __inherited : proto,
                constructor : Constructor
            }]));
            return Constructor;
        },
        // Usage: jQuery.extendPrototype([funcName], [prop1, [prop2 ...]])
        extendPrototype : function (){
            var firstIsString = isString(arguments[0]),
                funcName = firstIsString ? arguments[0] : '',
                args = slice.call(arguments, firstIsString ? 1 : 0),
                Constructor = getNamedFunction(Constructor);
            Constructor.prototype = $.extend.apply($, [{}].concat(args, [{
                constructor : Constructor
            }]));
            return Constructor;
        },
        extendProp: extendProp
        // cleanup: function(obj, proto){
        //     if(!proto) proto = obj.__proto__;
        //     for(var key in obj){
        //         if(!(key in proto)){
        //             delete obj[key];
        //         }
        //     }
        // }
    });
})(jQuery);