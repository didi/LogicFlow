export default {
  "nodes": [
      {
          "id": "StartEvent_1",
          "type": "startNode",
          "x": 160,
          "y": 155,
          "properties": {
              "data": {
                  "id": "start_type",
                  "nodeId": "110000",
                  "uniqueNodeId": "110000_U",
                  "nodeType": "startNode",
                  "subNodeType": "entrance",
                  "name": "入口",
                  "desc": "",
                  "oldNodeId": ""
              }
          }
      },
      {
          "id": "Menu_187ngj3",
          "type": "userNode",
          "x": 435,
          "y": 120,
          "properties": {
              "data": {
                  "id": "Menu_187ngj3",
                  "nodeId": "102020401280000",
                  "uniqueNodeId": "102020401150000_U",
                  "nodeType": "userNode",
                  "subNodeType": "menu",
                  "name": "主菜单",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "若勾选挂接base，请需选择所属问题",
                      "sendSurvey": 0,
                      "hasProvideService": 0
                  },
                  "playbackConfig": {
                      "enable": true,
                      "promptType": 3,
                      "ttsMsg": "",
                      "canInterrupt": 1,
                      "recordName": "",
                      "recordNameList": ""
                  },
                  "buttonListConfig": {
                      "enable": true,
                      "buttons": [
                          {
                              "ivrValue": "0",
                              "name": "api",
                              "enable": true
                          },
                          {
                              "ivrValue": "1",
                              "name": "adslfa",
                              "enable": true
                          }
                      ]
                  },
                  "tagConfig": {
                      "tagList": []
                  }
              }
          }
      },
      {
          "id": "Api_1dmh9v2",
          "type": "conditionNode",
          "x": 745,
          "y": 120,
          "properties": {
              "data": {
                  "id": "Api_1dmh9v2",
                  "nodeId": "102020401280001",
                  "uniqueNodeId": "102020401150001_U",
                  "nodeType": "conditionNode",
                  "subNodeType": "api",
                  "name": "节点",
                  "desc": "",
                  "apiConfig": {
                      "apiUrl": "/api/zhc_passenger_identity?phone=PHONE"
                  },
                  "branchListConfig": {
                      "enable": true,
                      "branches": [
                          {
                              "ivrValue": "0",
                              "name": "放音",
                              "enable": true
                          },
                          {
                              "ivrValue": "1",
                              "name": "人工",
                              "enable": true
                          }
                      ]
                  },
                  "tagConfig": {
                      "tagList": []
                  }
              }
          }
      },
      {
          "id": "PromptTone_1b6v1iw",
          "type": "executeNode",
          "x": 1050,
          "y": 120,
          "properties": {
              "data": {
                  "id": "PromptTone_1b6v1iw",
                  "nodeId": "102020401280002",
                  "uniqueNodeId": "102020401150002_U",
                  "nodeType": "executeNode",
                  "subNodeType": "promptTone",
                  "name": "节点",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "",
                      "sendSurvey": 1,
                      "hasProvideService": 1,
                      "oldSceneId": "740"
                  },
                  "playbackConfig": {
                      "enable": true,
                      "promptType": 1,
                      "ttsMsg": "正在转人工，请稍后",
                      "canInterrupt": 1
                  },
                  "buttonListConfig": {
                      "enable": false,
                      "buttons": []
                  }
              }
          }
      },
      {
          "id": "PromptTone_106fvw2",
          "type": "executeNode",
          "x": 770,
          "y": 530,
          "properties": {
              "data": {
                  "id": "PromptTone_106fvw2",
                  "nodeId": "102020401280003",
                  "uniqueNodeId": "102020401150003_U",
                  "nodeType": "executeNode",
                  "subNodeType": "promptTone",
                  "name": "节点",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "",
                      "sendSurvey": 0,
                      "hasProvideService": 0
                  },
                  "playbackConfig": {
                      "enable": true,
                      "promptType": 1,
                      "canInterrupt": 1,
                      "recordName": "",
                      "recordNameList": "",
                      "ttsMsg": "134"
                  },
                  "buttonListConfig": {
                      "enable": false,
                      "buttons": []
                  },
                  "tagConfig": {
                      "tagList": []
                  }
              }
          }
      },
      {
          "id": "SystemHangup_0ug61vy",
          "type": "executeNode",
          "x": 1315,
          "y": 120,
          "properties": {
              "data": {
                  "id": "SystemHangup_0ug61vy",
                  "nodeId": "102020401280004",
                  "uniqueNodeId": "102020401150004_U",
                  "nodeType": "executeNode",
                  "subNodeType": "systemHangup",
                  "name": "节点",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "",
                      "sendSurvey": 0,
                      "hasProvideService": 0,
                      "oldSceneId": "740"
                  }
              }
          }
      },
      {
          "id": "SystemHangup_0jvwtq6",
          "type": "executeNode",
          "x": 435,
          "y": 905,
          "properties": {
              "data": {
                  "id": "SystemHangup_0jvwtq6",
                  "nodeId": "102020401280005",
                  "uniqueNodeId": "102020401150005_U",
                  "nodeType": "executeNode",
                  "subNodeType": "systemHangup",
                  "name": "节点",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "",
                      "sendSurvey": 0,
                      "hasProvideService": 0,
                      "oldSceneId": "740"
                  }
              }
          }
      },
      {
          "id": "ApiConfiguration_1gfh7o1",
          "type": "conditionNode",
          "x": 435,
          "y": 335,
          "properties": {
              "data": {
                  "id": "ApiConfiguration_1gfh7o1",
                  "nodeId": "102020401280006",
                  "uniqueNodeId": "102020401150006_U",
                  "nodeType": "conditionNode",
                  "subNodeType": "api",
                  "name": "节点",
                  "desc": "",
                  "apiConfig": {
                      "apiUrl": "",
                      "apiConfigId": "40"
                  },
                  "branchListConfig": {
                      "enable": true,
                      "branches": [
                          {
                              "ivrValue": "0",
                              "name": "sdg",
                              "enable": true
                          }
                      ]
                  }
              }
          }
      },
      {
          "id": "TimeJudgment_0cfxwcm",
          "type": "conditionNode",
          "x": 435,
          "y": 530,
          "properties": {
              "data": {
                  "id": "TimeJudgment_0cfxwcm",
                  "nodeId": "102020401280007",
                  "uniqueNodeId": "102020401150007_U",
                  "nodeType": "conditionNode",
                  "subNodeType": "timeJudgment",
                  "name": "节点",
                  "desc": "",
                  "timeConfig": {
                      "dateType": 1,
                      "duration": "2022-02-16%2000%3A00%3A00~2022-03-14%2000%3A00%3A00"
                  },
                  "branchListConfig": {
                      "enable": true,
                      "branches": [
                          {
                              "ivrValue": "0",
                              "name": "否",
                              "enable": true
                          },
                          {
                              "ivrValue": "1",
                              "name": "是",
                              "enable": true
                          }
                      ]
                  }
              }
          }
      },
      {
          "id": "RepeatTimesJudgment_00mrph2",
          "type": "conditionNode",
          "x": 435,
          "y": 715,
          "properties": {
              "data": {
                  "id": "RepeatTimesJudgment_00mrph2",
                  "nodeId": "102020401280008",
                  "uniqueNodeId": "102020401150008_U",
                  "nodeType": "conditionNode",
                  "subNodeType": "repeatTimesJudgment",
                  "name": "节点",
                  "desc": "",
                  "repeatTimesConfig": {
                      "last": "10",
                      "times": "2",
                      "judgeType": "1"
                  },
                  "branchListConfig": {
                      "enable": true,
                      "branches": [
                          {
                              "ivrValue": "0",
                              "name": "否",
                              "enable": true
                          },
                          {
                              "ivrValue": "1",
                              "name": "是",
                              "enable": true
                          }
                      ]
                  }
              }
          }
      },
      {
          "id": "BurstBroadcast_1r2fefd",
          "type": "executeNode",
          "x": 770,
          "y": 715,
          "properties": {
              "data": {
                  "id": "BurstBroadcast_1r2fefd",
                  "nodeId": "102020401280009",
                  "uniqueNodeId": "102020401150009_U",
                  "nodeType": "executeNode",
                  "subNodeType": "burstBroadcast",
                  "name": "节点",
                  "desc": "",
                  "broadcastProperty": ""
              }
          }
      },
      {
          "id": "TransferManual_018khxz",
          "type": "transferNode",
          "x": 1060,
          "y": 240,
          "properties": {
              "data": {
                  "id": "TransferManual_018khxz",
                  "nodeId": "102020401280010",
                  "uniqueNodeId": "102020401150010_U",
                  "nodeType": "transferNode",
                  "subNodeType": "transferHotlineManual",
                  "name": "节点",
                  "desc": "",
                  "bizConfig": {
                      "bindMid": false,
                      "mid": -1,
                      "midPathName": "",
                      "sendSurvey": 0,
                      "hasProvideService": 0
                  },
                  "playbackConfig": {
                      "enable": true,
                      "promptType": 2,
                      "canInterrupt": 1,
                      "recordName": "ivrV2_menu.wav",
                      "recordNameList": ""
                  },
                  "transferManualConfig": {
                      "skillGroupId": "322"
                  },
                  "tagConfig": {
                      "tagList": []
                  }
              }
          }
      }
  ],
  "edges": [
      {
          "id": "SequenceFlow_1gnjo1z",
          "type": "polyline",
          "sourceNodeId": "StartEvent_1",
          "targetNodeId": "Menu_187ngj3",
          "startPoint": {
              "x": 260,
              "y": 155,
              "isSourceAnchor": true,
              "isTargetAnchor": false,
              "id": "StartEvent_1_0"
          },
          "endPoint": {
              "x": 335,
              "y": 90
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_1gnjo1z",
                  "ivrId": "02020401280000A",
                  "sourceNodeId": "StartEvent_1",
                  "targetNodeId": "Menu_187ngj3",
                  "oldIvrId": "SequenceFlow_1gnjo1z",
                  "oldTagInfo": "{\"1\":\"745\",\"2\":\"740\",\"3\":\"715\",\"4\":\"723\",\"5\":\"736\"}"
              },
              "style": {
                  "targetAnchorId": "Menu_187ngj3_anchor_1"
              }
          },
          "pointsList": [
              {
                  "x": 260,
                  "y": 155
              },
              {
                  "x": 290,
                  "y": 155
              },
              {
                  "x": 290,
                  "y": 90
              },
              {
                  "x": 335,
                  "y": 90
              }
          ]
      },
      {
          "id": "SequenceFlow_0tsr5dh",
          "type": "polyline",
          "sourceNodeId": "Menu_187ngj3",
          "targetNodeId": "Api_1dmh9v2",
          "startPoint": {
              "x": 525,
              "y": 125
          },
          "endPoint": {
              "x": 645,
              "y": 90
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_0tsr5dh",
                  "ivrId": "02020401280001A",
                  "sourceNodeId": "Menu_187ngj3",
                  "targetNodeId": "Api_1dmh9v2",
                  "oldIvrId": "SequenceFlow_0tsr5dh",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"740\",\"3\":\"715\",\"4\":\"730\",\"5\":\"734\"}",
                  "buttonConfig": {
                      "ivrValue": "0"
                  }
              },
              "style": {
                  "sourceAnchorId": "Menu_187ngj3_1",
                  "targetAnchorId": "Api_1dmh9v2_anchor_1"
              }
          },
          "text": {
              "x": 555,
              "y": 125,
              "value": "0"
          },
          "pointsList": [
              {
                  "x": 525,
                  "y": 125
              },
              {
                  "x": 585,
                  "y": 125
              },
              {
                  "x": 585,
                  "y": 90
              },
              {
                  "x": 645,
                  "y": 90
              }
          ]
      },
      {
          "id": "SequenceFlow_0f9irol",
          "type": "polyline",
          "sourceNodeId": "Api_1dmh9v2",
          "targetNodeId": "PromptTone_1b6v1iw",
          "startPoint": {
              "x": 835,
              "y": 125
          },
          "endPoint": {
              "x": 951.5,
              "y": 120
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_0f9irol",
                  "ivrId": "02020401280002A",
                  "sourceNodeId": "Api_1dmh9v2",
                  "targetNodeId": "PromptTone_1b6v1iw",
                  "oldIvrId": "SequenceFlow_0f9irol",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"740\",\"3\":\"715\",\"4\":\"730\",\"5\":\"734\"}",
                  "branchConfig": {
                      "ivrValue": "0"
                  }
              },
              "style": {
                  "sourceAnchorId": "Api_1dmh9v2_1",
                  "targetAnchorId": "PromptTone_1b6v1iw_anchor_1"
              }
          },
          "text": {
              "x": 864.125,
              "y": 125,
              "value": "0"
          },
          "pointsList": [
              {
                  "x": 835,
                  "y": 125
              },
              {
                  "x": 893.25,
                  "y": 125
              },
              {
                  "x": 893.25,
                  "y": 120
              },
              {
                  "x": 951.5,
                  "y": 120
              }
          ]
      },
      {
          "id": "SequenceFlow_1n2l6ey",
          "type": "polyline",
          "sourceNodeId": "PromptTone_1b6v1iw",
          "targetNodeId": "SystemHangup_0ug61vy",
          "startPoint": {
              "id": "PromptTone_1b6v1iw_anchor_3",
              "x": 1150,
              "y": 120,
              "isSourceAnchor": true,
              "isTargetAnchor": true
          },
          "endPoint": {
              "x": 1212.5,
              "y": 120
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_1n2l6ey",
                  "ivrId": "02020401280003A",
                  "sourceNodeId": "PromptTone_1b6v1iw",
                  "targetNodeId": "SystemHangup_0ug61vy",
                  "oldIvrId": "SequenceFlow_1n2l6ey",
                  "oldTagInfo": "%7B%221%22%3A%22739%22%2C%222%22%3A%22740%22%2C%223%22%3A%22715%22%2C%224%22%3A%22726%22%2C%225%22%3A%22734%2C736%22%7D"
              },
              "style": {
                  "targetAnchorId": "SystemHangup_0ug61vy_anchor_1"
              }
          },
          "pointsList": [
              {
                  "x": 1150,
                  "y": 120
              },
              {
                  "x": 1212.5,
                  "y": 120
              }
          ]
      },
      {
          "id": "SequenceFlow_046fxi7",
          "type": "polyline",
          "sourceNodeId": "Menu_187ngj3",
          "targetNodeId": "ApiConfiguration_1gfh7o1",
          "startPoint": {
              "x": 525,
              "y": 155
          },
          "endPoint": {
              "x": 436.5,
              "y": 298
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_046fxi7",
                  "ivrId": "02020401280004A",
                  "sourceNodeId": "Menu_187ngj3",
                  "targetNodeId": "ApiConfiguration_1gfh7o1",
                  "oldIvrId": "SequenceFlow_046fxi7",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"740\",\"3\":\"715\",\"4\":\"686\",\"5\":\"733\"}",
                  "buttonConfig": {
                      "ivrValue": "1"
                  }
              },
              "style": {
                  "sourceAnchorId": "Menu_187ngj3_2",
                  "targetAnchorId": "ApiConfiguration_1gfh7o1_anchor_2"
              }
          },
          "text": {
              "x": 500.75,
              "y": 270,
              "value": "1"
          },
          "pointsList": [
              {
                  "x": 525,
                  "y": 155
              },
              {
                  "x": 565,
                  "y": 155
              },
              {
                  "x": 565,
                  "y": 270
              },
              {
                  "x": 436.5,
                  "y": 270
              },
              {
                  "x": 436.5,
                  "y": 298
              }
          ]
      },
      {
          "id": "SequenceFlow_109rdmo",
          "type": "polyline",
          "sourceNodeId": "ApiConfiguration_1gfh7o1",
          "targetNodeId": "TimeJudgment_0cfxwcm",
          "startPoint": {
              "x": 526.5,
              "y": 353
          },
          "endPoint": {
              "x": 436.5,
              "y": 479.5
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_109rdmo",
                  "ivrId": "02020401280005A",
                  "sourceNodeId": "ApiConfiguration_1gfh7o1",
                  "targetNodeId": "TimeJudgment_0cfxwcm",
                  "oldIvrId": "SequenceFlow_109rdmo",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"741\",\"3\":\"716\",\"4\":\"730\",\"5\":\"733\"}",
                  "branchConfig": {
                      "ivrValue": "0"
                  }
              },
              "style": {
                  "sourceAnchorId": "ApiConfiguration_1gfh7o1_1",
                  "targetAnchorId": "TimeJudgment_0cfxwcm_anchor_2"
              }
          },
          "text": {
              "x": 500.75,
              "y": 450,
              "value": "0"
          },
          "pointsList": [
              {
                  "x": 526.5,
                  "y": 353
              },
              {
                  "x": 565,
                  "y": 353
              },
              {
                  "x": 565,
                  "y": 450
              },
              {
                  "x": 436.5,
                  "y": 450
              },
              {
                  "x": 436.5,
                  "y": 479.5
              }
          ]
      },
      {
          "id": "SequenceFlow_08b6d2h",
          "type": "polyline",
          "sourceNodeId": "TimeJudgment_0cfxwcm",
          "targetNodeId": "RepeatTimesJudgment_00mrph2",
          "startPoint": {
              "x": 526.5,
              "y": 564.5
          },
          "endPoint": {
              "x": 436.5,
              "y": 664
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_08b6d2h",
                  "ivrId": "02020401280006A",
                  "sourceNodeId": "TimeJudgment_0cfxwcm",
                  "targetNodeId": "RepeatTimesJudgment_00mrph2",
                  "oldIvrId": "SequenceFlow_08b6d2h",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"740\",\"3\":\"715\",\"4\":\"730\",\"5\":\"733\"}",
                  "branchConfig": {
                      "ivrValue": "1"
                  }
              },
              "style": {
                  "sourceAnchorId": "TimeJudgment_0cfxwcm_2",
                  "targetAnchorId": "RepeatTimesJudgment_00mrph2_anchor_2"
              }
          },
          "text": {
              "x": 500.75,
              "y": 635,
              "value": "1"
          },
          "pointsList": [
              {
                  "x": 526.5,
                  "y": 564.5
              },
              {
                  "x": 565,
                  "y": 564.5
              },
              {
                  "x": 565,
                  "y": 635
              },
              {
                  "x": 436.5,
                  "y": 635
              },
              {
                  "x": 436.5,
                  "y": 664
              }
          ]
      },
      {
          "id": "SequenceFlow_1lrwmbl",
          "type": "polyline",
          "sourceNodeId": "RepeatTimesJudgment_00mrph2",
          "targetNodeId": "SystemHangup_0jvwtq6",
          "startPoint": {
              "x": 526.5,
              "y": 719
          },
          "endPoint": {
              "x": 436.5,
              "y": 884.5
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_1lrwmbl",
                  "ivrId": "02020401280007A",
                  "sourceNodeId": "RepeatTimesJudgment_00mrph2",
                  "targetNodeId": "SystemHangup_0jvwtq6",
                  "oldIvrId": "SequenceFlow_1lrwmbl",
                  "oldTagInfo": "{\"1\":\"739\",\"2\":\"740\",\"3\":\"715\",\"4\":\"730\",\"5\":\"734\"}",
                  "branchConfig": {
                      "ivrValue": "0"
                  }
              },
              "style": {
                  "sourceAnchorId": "RepeatTimesJudgment_00mrph2_1",
                  "targetAnchorId": "SystemHangup_0jvwtq6_anchor_2"
              }
          },
          "text": {
              "x": 565,
              "y": 787,
              "value": "0"
          },
          "pointsList": [
              {
                  "x": 526.5,
                  "y": 719
              },
              {
                  "x": 565,
                  "y": 719
              },
              {
                  "x": 565,
                  "y": 855
              },
              {
                  "x": 436.5,
                  "y": 855
              },
              {
                  "x": 436.5,
                  "y": 884.5
              }
          ]
      },
      {
          "id": "SequenceFlow_02p8t04",
          "type": "polyline",
          "sourceNodeId": "TimeJudgment_0cfxwcm",
          "targetNodeId": "PromptTone_106fvw2",
          "startPoint": {
              "x": 526.5,
              "y": 534.5
          },
          "endPoint": {
              "x": 670,
              "y": 530
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_02p8t04",
                  "ivrId": "02020401280008A",
                  "sourceNodeId": "TimeJudgment_0cfxwcm",
                  "targetNodeId": "PromptTone_106fvw2",
                  "oldIvrId": "SequenceFlow_02p8t04",
                  "branchConfig": {
                      "ivrValue": "0"
                  }
              },
              "style": {
                  "sourceAnchorId": "TimeJudgment_0cfxwcm_1",
                  "targetAnchorId": "PromptTone_106fvw2_anchor_1"
              }
          },
          "text": {
              "x": 562.375,
              "y": 534.5,
              "value": "0"
          },
          "pointsList": [
              {
                  "x": 526.5,
                  "y": 534.5
              },
              {
                  "x": 598.25,
                  "y": 534.5
              },
              {
                  "x": 598.25,
                  "y": 530
              },
              {
                  "x": 670,
                  "y": 530
              }
          ]
      },
      {
          "id": "SequenceFlow_1h2jd3o",
          "type": "polyline",
          "sourceNodeId": "RepeatTimesJudgment_00mrph2",
          "targetNodeId": "BurstBroadcast_1r2fefd",
          "startPoint": {
              "x": 526.5,
              "y": 749
          },
          "endPoint": {
              "x": 671,
              "y": 714
          },
          "properties": {
              "data": {
                  "id": "SequenceFlow_1h2jd3o",
                  "ivrId": "02020401280009A",
                  "sourceNodeId": "RepeatTimesJudgment_00mrph2",
                  "targetNodeId": "BurstBroadcast_1r2fefd",
                  "oldIvrId": "SequenceFlow_1h2jd3o",
                  "branchConfig": {
                      "ivrValue": "1"
                  }
              },
              "style": {
                  "sourceAnchorId": "RepeatTimesJudgment_00mrph2_2",
                  "targetAnchorId": "BurstBroadcast_1r2fefd_anchor_1"
              }
          },
          "text": {
              "x": 562.625,
              "y": 749,
              "value": "1"
          },
          "pointsList": [
              {
                  "x": 526.5,
                  "y": 749
              },
              {
                  "x": 598.75,
                  "y": 749
              },
              {
                  "x": 598.75,
                  "y": 714
              },
              {
                  "x": 671,
                  "y": 714
              }
          ]
      },
      {
          "id": "c2a66f09-eddc-4090-8644-5af888ca21b5",
          "type": "polyline",
          "sourceNodeId": "Api_1dmh9v2",
          "targetNodeId": "TransferManual_018khxz",
          "startPoint": {
              "x": 835,
              "y": 155
          },
          "endPoint": {
              "x": 1060,
              "y": 220
          },
          "properties": {
              "data": {
                  "id": "c2a66f09-eddc-4090-8644-5af888ca21b5",
                  "sourceNodeId": "Api_1dmh9v2",
                  "targetNodeId": "TransferManual_018khxz",
                  "branchConfig": {
                      "ivrValue": "1"
                  },
                  "ivrId": "02020401280010A"
              },
              "style": {
                  "sourceAnchorId": "Api_1dmh9v2_4",
                  "targetAnchorId": 3
              }
          },
          "text": {
              "x": 947.5,
              "y": 155,
              "value": "1"
          },
          "pointsList": [
              {
                  "x": 835,
                  "y": 155
              },
              {
                  "x": 1060,
                  "y": 155
              },
              {
                  "x": 1060,
                  "y": 220
              }
          ]
      }
  ]
}