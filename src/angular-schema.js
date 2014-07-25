/*global jQuery, angular, console*/


(function ($) {
    'use strict';
    var logging = {
            create: function () {
                // console.log.apply(console, arguments);
            },
            resolve: function () {
                console.log.apply(console, arguments);
            }
        },
        createHandler,
        sanitizeHandler;
    // function extendEx
    // jQuery.extendに配列同士のマージ機能を追加する。
    // 配列を見つけた場合、基本的にはconcatenateするが、配列の要素がオブジェクトでありname属性を持つ場合は、ディープextendをする。
    function extendEx() {
        var src, copyIsArray, copy, name, options, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            // skip the boolean and the target
            target = arguments[i] || {};
            i += 1;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }

        // extend jQuery itself if only one argument is passed
//        if (i === length) {
//            target = this;
//            i -= 1;
//        }
        for (null; i < length; i += 1) {
            // Only deal with non-null/undefined values
            options = arguments[i];
            if (options != null) {
                // Enable Array concatenation
                // added by Norimasa Ikeda
                if (deep && jQuery.isArray(target) && jQuery.isArray(options)) {
                    var targetMap = {};
                    jQuery.each(target, function (i, obj) {
                        if (obj.name) {
                            targetMap[obj.name] = obj;
                        }
                    });
                    jQuery.each(options, function (i, obj) {
                        var src = targetMap[obj.name];
                        if (obj.name && src) {
                            extendEx(deep, src, obj);
                        } else {
                            target.push(obj);
                        }
                    });
                    continue;
                }
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }
                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];

                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[name] = extendEx(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    }
    function createObject(schema, proto) {
        return createHandler[createHandler.hasOwnProperty(schema.type)  ? schema.type : 'default'](schema, proto);
    }
    function resolveSchema(schema, definition, type) {
        var baseSchema = type || schema.$extends;
        if (baseSchema && !definition[baseSchema]) {
            throw ('schema error ' + baseSchema + ' undefined');
        }
        if (baseSchema) {
//            logging.resolve('schema resolved(1) ', baseSchema, definition[baseSchema], schema);
            schema =  extendEx(true, {}, resolveSchema(definition[baseSchema], definition), schema);
//            logging.resolve('schema resolved(2) ', schema);
        }
        return schema;
    }


    createHandler = {
        'object': function (schema, proto) {
//            if (schema.defaultValue) { return schema.defaultValue; }
            var response = angular.isObject(proto) ? proto : (schema.defaultValue || {}),
                fieldMap = {};
            // 要らないプロパティがないことを確認
            angular.forEach(schema.fields, function (fieldSchema) {
                fieldMap[fieldSchema.name] = fieldSchema;
            });
            angular.forEach(response, function(value, key){
                if (!fieldMap.hasOwnProperty(key)) {
                    delete response[key];
                }
            });
            // 必要なプロパティがあることを確認
            angular.forEach(schema.fields, function (fieldSchema) {
                response[fieldSchema.name] = createObject(fieldSchema, response.hasOwnProperty(fieldSchema.name) ? response[fieldSchema.name] : undefined);
            });
            logging.create('createObject', response);
            return response;
        },
        'array': function (schema, proto) {
            if (angular.isArray(proto)) {
                return $.map(proto, function (item) {
                    return [createObject(schema.element, item)];
                });
            }
            return [];
        },
        'string': function (schema, proto) {
            if (angular.isString(proto)) {
                return proto;
            }
            return String(schema.defaultValue || "");
        },
        'default': function(schema, proto) {
            return proto !== undefined ? proto : null;
        }
    };

    $.extend({
        'schemalib': {
            createObject: createObject,
            resolveSchema: resolveSchema,
            // 親階層のデータと、この階層のデータから、この階層の$definition, schemaを求める
            merge: function (current, parent, update, type) {
                // 親階層のdefinitionと、この階層のdefinitionをマージする
                var definition = $.extend({}, parent.$definition, update.$definition),
                // definitionとこの階層のschemaをマージする
                    schema = resolveSchema(update, definition, current.data && current.data.$type);
                $.extend(current, {
                    $definition: definition,
                    schema: schema
                });
                current.data = createObject(schema, current.data);

            },
            // 配列スキーマを持つ現在階層データからのオブジェクトを作る
            create: function (current) {
                console.log('created', createObject(resolveSchema(current.schema.element, current.$definition)));
                return createObject(resolveSchema(current.schema.element, current.$definition));
            },
            // 現在階層のデータからviewTypeを得る
            getviewType: function (current) {
                if (current.schema.enum && current.schema.enum.length) {
                    return 'enum';
                }
                return current.schema.type;
            }
        }
    });
}(jQuery));

(function (angular, $) {
    'use strict';

    var logging = {
        info: function () {
            console.log.apply(console, arguments);
        },
        watch: function () {
//            console.log.apply(console, arguments);
        },
        remove: function () {
//            console.log.apply(console, arguments);
        }
    };

    // modeled after: angular-1.0.7/src/ng/directive/ngInclude.js
    angular.module('schemalib', [])
        .directive('sclSchema', ['$http', '$templateCache', '$compile', '$parse',
            function ($http, $templateCache, $compile, $parse) {
                return {
                    restrict: 'ECA',
                    terminal: true,
                    compile: function (element, attr) {
                        var accessor = {
                                schema: $parse(attr.sclBindingSchema || ''),
                                data: $parse(attr.sclBindingData || ''),
                                dataType: $parse(attr.sclBindingData + '.$type' || ''),
                                definition: $parse('$definition')
                            };
                        return function (scope, element) {
                            var oldViewType = null,
                                src = attr.src || scope.src,
                                childScope = $.extend(scope.$new(), {
                                    removeItem: function (index) {
                                        childScope.data.splice(index, 1);
                                    },
                                    addItem: function () {
                                        if (!childScope.data) { childScope.data = []; }
                                        childScope.data.push($.schemalib.create(childScope));
                                    },
                                    removeThisItem: function () {
                                        childScope.$parent.$parent.removeItem(childScope.$parent.$index);
                                    },
                                    isArrayElement: function () {
                                        return $.isArray(childScope.$parent.$parent.data);
                                    },
                                    src: src
                                }),
                                clearContent = function () {
                                    if (childScope) {
                                        childScope.$destroy();
                                        childScope = null;
                                    }
                                };
                            // scope.data -> childScope.data
                            scope.$watch(accessor.data, function dataWatchAction() {
                                logging.watch('dataWatchAction');
                                childScope.data = accessor.data(scope);
                            });

                            childScope.$watch('data', function childDataWatchAction() {
                                logging.watch('childDataWatchAction', childScope.data, childScope.data ? childScope.data.$$hashKey : 'none');
                                if ((childScope.data instanceof String || typeof childScope.data === "string") && childScope.data.$$hashKey === undefined) {
                                    childScope.data.$$hashKey = "&" + childScope.data;
                                }
                                accessor.data.assign(scope, childScope.data);
                            }, true);

                            $http.get(src, {cache: $templateCache}).success(function (response) {
                                // scope.schema -> childScope.schema, childScope.fragment, childScope.definition, persistentScope
                                function schemaWatchAction(newVal, oldVal) {
                                    logging.watch('schemaWatchAction', newVal, oldVal);
                                    var bindSchema = accessor.schema(scope),
                                        viewType,
                                        contents;
                                    if (!bindSchema) { return; }
                                    $.schemalib.merge(childScope, scope, bindSchema, childScope.data && childScope.data.$type);
                                    if (!childScope.schema) { return; }
                                    // DOM要素を設定する（fragmentに変化があったときのみ）
                                    viewType = childScope.schema.enum && childScope.schema.enum.length ? 'enum' : childScope.schema.type;
                                    if (oldViewType !== viewType) {
                                        if (viewType) {
                                            contents = angular.element('<div></div>').html(response).find('#' + viewType);
                                            if (contents.length === 0) {
                                                console.log('viewType not found "' + viewType + '"');
                                                return;
                                            }
                                        } else {
                                            contents = '';
                                        }
                                        $compile(contents)(childScope);
                                        element.html(contents);
                                    }
                                    oldViewType = viewType;
                                    // valueExpression機能による値の自動設定
                                    if (childScope.schema.valueExpression) {
                                        scope.$watch("data." + childScope.schema.valueExpression, function (val) {
                                            childScope.data = val;
                                        });
                                    }

                                }
                                scope.$watch(accessor.schema, schemaWatchAction, true);
                                scope.$watch(accessor.definition, schemaWatchAction);
                                scope.$watch(accessor.dataType, schemaWatchAction);
                            }).error(function () {
                                clearContent();
                            });
                            // クリーンナップ処理
                            scope.$on('$destroy', function () {
                                clearContent();
                            });
                        };
                    }
                };
            }])
        .directive('sclInclude', ['$http', '$templateCache', '$compile',
            function ($http, $templateCache, $compile) {
                return {
                    restrict: 'ECA',
                    terminal: true,
                    compile: function (element, attr) {
                        return function (scope, element) {
                            var src = attr.src || scope.src;
                            $http.get(src, {cache: $templateCache}).success(function (response) {
                                var contents = angular.element('<div></div>').html(response).find(attr.fragment);
                                $compile(contents)(scope);
                                element.html(contents);
                            });
                        };
                    }
                };
            }]);
}(angular, jQuery));

