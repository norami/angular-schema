/*global angular*/

(function (angular) {
    'use strict';
    var app = angular.module("App", ['ui.sortable', 'jqueryWrapper', 'schemalib', 'ngPrettyJson', 'localytics.directives']);
    app.controller("FormController", function ($scope) {
        $scope.metaschema = {
            $extends: 'schema',
            $definition: {
                schema: {
                    name: 'schema',
                    type: 'object',
                    fields: [
                        {
                            name: '$type',// スキーマのセレクタ
                            displayName: 'タイプ',
                            type: 'string',
                            enum: [
                                {name: '真偽値', value: 'boolean'},
                                {name: '文字列', value: 'string'},
                                {name: '整数', value: 'integer'},
                                {name: '数値', value: 'number'},
                                {name: 'オブジェクト', value: 'object'},
                                {name: '配列', value: 'array'},
                                {name: '集合', value: 'set'},
                                {name: '日付', value: 'Date'}
                            ],
                            defaultValue: 'schema'
                        },
                        {
                            name: 'name',
                            displayName: 'フィールド名',
                            type: 'string'
                        },
                        {
                            name: 'displayName',
                            displayName: '表示名',
                            type: 'string'
                        },
                        {
                            name: 'type', // htmlに指定されるタイプ
                            displayName: 'データ型',
                            type: 'string',
//                            enum: [
//                                {name: '真偽値', value: 'boolean'},
//                                {name: '文字列', value: 'string'},
//                                {name: '整数', value: 'integer'},
//                                {name: '数値', value: 'number'},
//                                {name: 'オブジェクト', value: 'object'},
//                                {name: '配列', value: 'array'}
//                            ],
                            hidden : true,
                            valueExpression: '$type'
                        }
                    ]
                },
                boolean: {
                    $extends: 'schema',
                    name: 'boolean',
                    type: 'object'
                },
                number: {
                    $extends: 'schema',
                    name: 'number',
                    type: 'object',
                    fields: [
                        {
                            name: 'enum',
                            type: 'array',
                            element: {
                                name: 'enumItem',
                                type: 'object',
                                fields: [
                                    {
                                        name: 'name',
                                        type: 'string'
                                    },
                                    {
                                        name: 'value',
                                        type: 'string'
                                    }
                                ]
                            }
                        },
                        {
                            name: 'step',
                            type: 'number'
                        },
                        {
                            name: 'maximum',
                            type: 'number'
                        },
                        {
                            name: 'minimum',
                            type: 'number'
                        }
                    ]
                },
                integer: {
                    $extends: 'schema',
                    name: 'integer',
                    type: 'object',
                    fields: [
                        {
                            name: 'enum',
                            type: 'array',
                            element: {
                                name: 'enumItem',
                                type: 'object',
                                fields: [
                                    {
                                        name: 'name',
                                        type: 'string'
                                    },
                                    {
                                        name: 'value',
                                        type: 'integer'
                                    }
                                ]
                            }
                        },
                        {
                            name: 'minimum',
                            type: 'integer'
                        },
                        {
                            name: 'maximum',
                            type: 'integer'
                        }
                    ]
                },
                string: {
                    $extends: 'schema',
                    name: 'string',
                    type: 'object',
                    fields: [
                        {
                            name: 'enum',
                            type: 'array',
                            element: {
                                name: 'enumItem',
                                type: 'object',
                                fields: [
                                    {
                                        name: 'name',
                                        type: 'string'
                                    },
                                    {
                                        name: 'value',
                                        type: 'string'
                                    }
                                ]
                            }
                        }
                    ]
                },
                object: {
                    $extends: 'schema',
                    name: 'object',
                    type: 'object',
                    fields: [

                        {
                            name: 'fields',
                            type: 'array',
                            element: {
                                $extends: 'schema'
                            }
                        }
                    ]
                },
                array: {
                    $extends: 'schema',
                    name: 'array',
                    type: 'object',
                    fields: [
                        {
                            name: 'element',
                            $extends: 'schema'
                        }
                    ]
                },
                set: {
                    $extends: 'schema',
                    name: 'set',
                    type: 'object',
                    fields: [
                        {
                            name: 'element',
                            $extends: 'schema'
                        }
                    ]
                },
                Date: {
                    $extends: 'schema',
                    name: 'Date',
                    type: 'object'
                }
            }
        };
        $scope.schema = {
            name: 'people',
            $type: 'array',
            type: 'array',
            element:    {
                name: 'person',
                $type: 'object',
                type: 'object',
                fields: [
                    {
                        name: 'married',
                        displayName: '既婚',
                        $type: 'boolean',
                        type: 'boolean'
                    },
                    {
                        name: 'gender',
                        $type: 'integer',
                        type: 'integer',
                        enum: [{name: 'male', value: 1}, {name: 'female', value: 2}]
                    },
                    {
                        name: 'firstName',
                        $type: 'string',
                        type: 'string'
                    },
                    {
                        name: 'lastName',
                        $type: 'string',
                        type: 'string'
                    },
                    {
                        name: 'face',
                        $type: 'object',
                        type: 'object',
                        fields: [
                            {
                                $type: 'string',
                                type: 'string',
                                name: 'nose'
                            },
                            {
                                $type: 'string',
                                type: 'string',
                                name: 'mouse'
                            }
                        ]
                    },
                    {
                        name: 'addresses',
                        $type: 'array',
                        type: 'array',
                        element: {
                            name: 'address',
                            $type: 'object',
                            type: 'object',
                            fields: [
                                {
                                    $type: 'string',
                                    type: 'string',
                                    name: 'country'
                                },
                                {
                                    $type: 'string',
                                    type: 'string',
                                    name: 'region'
                                }
                            ]
                        }
                    },
                    {
                        name: 'keywords',
                        $type: 'array',
                        element: {
                            name: 'keyword',
                            $type: 'string',
                            type: 'string'
                        }
                    },
                    {
                        name: 'tags',
                        $type: 'set',
                        element: {
                            name: 'tag',
                            $type: 'string',
                            type: 'string',
                            enum: [
                                {name: 'AngularJS', value: 'AngularJS'},
                                {name: 'javascript', value: 'javascript'},
                                {name: 'web', value: 'web'}
                            ]
                        }
                    }
                ]
            }
        };
        $scope.data = [
            {
                firstName: '#1',
                lastName: '#2',
                face: {
                    nose: '#3',
                    mouse: '#4'
                },
                addresses: [
                    {
                        country: 'Japan',
                        region: 'Tokyo'
                    },
                    {
                        country: 'US',
                        region: 'New York'
                    }
                ]

            },
            {
                firstName: '#1',
                lastName: '#2',
                face: {
                    nose: '#3',
                    mouse: '#4'
                },
                addresses: [
                    {
                        country: 'Japan',
                        region: 'Tokyo'
                    },
                    {
                        country: 'US',
                        region: 'New York'
                    }
                ]
            }
        ];
        $scope.dates = [];
        $scope.dateList = ["2014-05-09", "2014-05-10", "2014-05-16", "2014-05-17"];
    });
}(angular));
