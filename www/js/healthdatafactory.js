var hoursGroup = 6;

starter.factory('HealthKitDataFactory', function(){
  return {
    getSteps:function(startDate, endDate, aggregation,callBack){
      this.isHealthKitAvailable(function(success){
        if (success) {
          window.plugins.healthkit.querySampleTypeAggregated({'startDate':startDate,'endDate':endDate ,'aggregation': aggregation,'sampleType': 'HKQuantityTypeIdentifierStepCount','unit': 'count'},function(data){
            if (callBack) {
              callBack(data);
            }
          },function(error){
            console.error(error);
          });
        } else {
          if (callBack) {
            callBack([]);
          }
        }
      });
    },
    getWalkRun:function(startDate, endDate, aggregation,callBack){
      this.isHealthKitAvailable(function(success){
        if (success) {
          window.plugins.healthkit.querySampleTypeAggregated({'startDate': startDate,'endDate': endDate,'aggregation': aggregation,'sampleType': 'HKQuantityTypeIdentifierDistanceWalkingRunning','unit': 'km'},function(data){
            if (callBack) {
              callBack(data);
            }
          },function(error){
            console.error(error);
          });
        } else {
          if (callBack) {
            callBack([]);
          }
        }
      });
    },
    getCalories:function(startDate, endDate, aggregation,callBack){
      this.isHealthKitAvailable(function(success){
        if (success) {
          window.plugins.healthkit.querySampleTypeAggregated({'startDate': startDate,'endDate': endDate,'aggregation': aggregation,'sampleType': 'HKQuantityTypeIdentifierActiveEnergyBurned','unit': 'kcal'},function(data){
            if (callBack) {
              callBack(data);
            }
          },function(error){
            console.error(error);
          });
        } else {
          if (callBack) {
            callBack([]);
          }
        }
      });
    },
    getFloors:function(startDate, endDate, aggregation,callBack){
      this.isHealthKitAvailable(function(success){
        if (success) {
          window.plugins.healthkit.querySampleTypeAggregated({'startDate': startDate,'endDate': endDate,'aggregation': aggregation,'sampleType': 'HKQuantityTypeIdentifierFlightsClimbed','unit': 'count'},function(data){
            if (callBack) {
              callBack(data);
            }
          },function(error){
            console.error(error);
          });
        } else {
          if (callBack) {
            callBack([]);
          }
        }
      });
    },
    isHealthKitAvailable:function(callBack){
      if (window.plugins.healthkit) {
        window.plugins.healthkit.available(function(success){
          if (callBack) {
            callBack(success);
          }
        },
        function(failed){
          console.log('Healthkit Failed');
          if (callBack) {
            callBack(false);
          }
        }
        );
      } else {
        if (callBack) {
          callBack(false);
        }
      }
    },
    dataManager:{
      getQuantitiesByDay:function(data,fixed){
        if (!fixed) {
          fixed = 0;
        }
        var quantityList = [];
        for (var i = 0; i < data.length; i++) {
          var value = data[i];
          var val = value.quantity;
          quantityList.push(val.toFixed(fixed));
        }
        return quantityList;
      },
      getQuantitiesByDayForYear:function(data,fixed){
        if (!fixed) {
          fixed = 0;
        }
        var quantityList = [];

        var startMonth = new Date(data[0].startDate).getMonth();
        var sumVal = 0;

        for (var i = 0; i < data.length; i++) {
         var value = data[i];
         var currMonth = new Date(value.startDate).getMonth();

         var val = value.quantity;
         if (startMonth == currMonth) {
          sumVal = sumVal + parseFloat(val);
        } else {
          quantityList.push(sumVal.toFixed(fixed));
          sumVal = parseFloat(val);
          startMonth = currMonth;
        } 
      }
      quantityList.push(sumVal.toFixed(fixed));

      return quantityList;
    },

    getDays:function(data){
      var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
      var daysFormated = [];
      for (var i = 0; i < data.length; i++) {
        var value = data[i]
        var ind = new Date(value.startDate).getDay();
        daysFormated.push(days[ind]);
      }
      return daysFormated;
    },
    getMonthDays:function(data){
      var daysFormated = [];

      for (var i = 0; i < data.length; i++) {
        var value = data[i]
        var ind = new Date(value.startDate).getDate();
        daysFormated.push(ind);
      }
      return daysFormated;
    },
    getYears:function(data){
      var daysFormated = [];
      var startMonth = new Date(data[0].startDate).getMonth();

      daysFormated.push(startMonth+1);

      for (var i = 0; i < data.length; i++) {
        var value = data[i]
        var currMonth = new Date(value.startDate).getMonth();
        if (startMonth != currMonth) {
          startMonth = currMonth;
          daysFormated.push(startMonth+1);
        }
      }

      return daysFormated;
    },


    getQuantityByHours:function(data,fixed){
      if (!fixed) {
        fixed = 0;
      }
      var quantityList = [];
      for (var j = 0; j < hoursGroup; j++) {
        quantityList.push([]);
      }
      for (var i = 0; i < data.length; i++) {
        var value = data[i];
        var quantity = value.quantity;
        var pos = i % hoursGroup;
        quantityList[pos].push(quantity.toFixed(fixed));
      }
      return quantityList;
    },
    getHours:function(data){
      var hours = [];
      var label = "";
      for (var i = 0; i < data.length; i++) {
        var value = data[i]
        var ind = new Date(value.startDate).getHours();
        if (label.length == 0) {
          label = ind;
        }
        if ((i+1) % hoursGroup == 0) {
          ind = new Date(value.endDate).getHours();
          label += " - ";
          label += ind;
          hours.push([label]);
          label = "";
        }
      }
      return hours;
    },
    getTotalQuantity:function(data){
      var count = 0;
      for (var i = 0; i < data.length; i++) {
        var value = data[i]
        count += value.quantity;
      }
      return count;
    },
    getColorsForYear:function(valuesArr, data, targetValue, startDateKey) {
        //Calculate targets arr for per month
        var targetsArr = [];

        if (data.length > 0) {
          var startMonth = new Date(data[0][startDateKey]).getMonth();
          var sumVal = 0.0;
          angular.forEach(data, function(value, index){
            var currMonth = new Date(value[startDateKey]).getMonth();

            if (startMonth == currMonth) {
              sumVal = sumVal + targetValue;
            } else {
              targetsArr.push(sumVal.toFixed(2));
              sumVal = targetValue;
              startMonth = currMonth;
            }           
          });
          targetsArr.push(sumVal.toFixed(2));
        }


        var bgColors = new Array();
        var colors = new Array();
        angular.forEach(valuesArr,function(value,index){
          if (targetsArr[index] && parseFloat(value) >= parseFloat(targetsArr[index])) {
          colors.push('rgb(133, 196, 65)');//greencolor
        } else {
          colors.push('rgb(111, 109, 110)');//gray color
        }
      });
        bgColors.push({backgroundColor : colors});

        ////
        
        
        return bgColors;
      },
      getColorsForWeek:function(valuesArr,targetValue) {
        var bgColors = new Array();
        var colors = new Array();
        angular.forEach(valuesArr,function(value,index){
          if (targetValue && parseFloat(value) >= parseFloat(targetValue)) {
          colors.push('rgb(133, 196, 65)');//greencolor
        } else {
          colors.push('rgb(111, 109, 110)');//gray color
        }
      });
        bgColors.push({backgroundColor : colors});
        return bgColors;
      },
      getColorsForDay:function(valuesArr,targetValue){
        var bgColors = new Array();
        angular.forEach(valuesArr,function(subValuesArr,index){
          var colors = new Array();
          angular.forEach(subValuesArr,function(subValue,index){
            if (targetValue && parseFloat(value) >= parseFloat(targetValue)) {
            colors.push('rgb(133, 196, 65)');//greencolor
          } else {
            colors.push('rgb(111, 109, 110)');//gray color
          }
        });
          bgColors.push({backgroundColor : colors});
        });
        return bgColors;
      },
      getOptions:function(maxVal){
        return {
          tooltips:{
            custom:function(tooltip){
              var newTitle = '';
              if (tooltip.title) {
                newTitle = tooltip.title[0];
              }
              if (tooltip.body) {
                newTitle = newTitle+tooltip.body[0];
              }
              tooltip.title = [];
              tooltip.titleSpacing = -2;
              tooltip.body = [newTitle];
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero:true,
                autoSkip:false,
                // max:(maxVal<10)?(maxVal+1):maxVal,
                suggestedMax:(maxVal<10)?(maxVal+1):maxVal
              }
            }],
            xAxes: [{
              position: 'top',
              ticks: {
                maxRotation:90,
                minRotation:0,
                fontSize:8
              }
            }]
          },
          multiTooltipTemplate: function(label) {
            return label.label + '-' + label.value;
          }
        };
      }
    }
  };
})

.factory('GoogleFitDataFactory', function(DateFormat, GetMeasurementDetails){
  return {
    getAllData:function(startTime, endTime, aggregation,callBack, errorCallback){
      console.log("Request google fit data ");

      var dataTypes = ['com.google.step_count.delta','com.google.distance.delta','com.google.calories.expended'];
      if (window.plugins != 'undefined') {
        if (window.plugins.googlefit != 'undefined') {
          window.plugins.googlefit.getStuff2(
            startTime,    // Start time in milliseconds
            endTime,    // End time in milliseconds
            dataTypes,        // Datatypes under the URL format specified by GoogleFit
            dataTypes,        // Datatypes under the URL format specified by GoogleFit
            1,                // Duration value of the databucket
            aggregation,           // TimeUnit that quantify the duration unit (DAYS, HOURS, MINUTES, SECONDS)
            0,                // Type of the Buckets (0: ByTime, 1: ByActivityType, 2: ByActivitySegment),
            GetMeasurementDetails().heightm*100,
            GetMeasurementDetails().weightkg,
            function(dataList) {

              console.log("Google fit data response "+dataList);
              
              // Success callback. The data object is a JSON that follows
              // the structure of GoogleFit data structures
              // console.log('Android Googlefit Data ' +JSON.stringify(dataList));
              var stepsData = [];
              var caloriesData = [];
              var distanceData = [];

              angular.forEach(dataList, function(dataObj, index){
                var datasetsList = dataObj.datasets;
                angular.forEach(datasetsList, function(datasetObj, index){
                  if (datasetObj.length == 0) {
                    var startDate = new Date(dataObj.start);
                    var endDate = new Date(dataObj.end);
                    var field = '';
                    if (index == 0) {
                      field = 'steps';
                    }
                    if (index == 1) {
                      field = 'distance';
                    }
                    if (index == 2) {
                      field = 'calories';
                    }
                    var createDataObjIfEmpty = {
                      "start": DateFormat.dateToStrType2(startDate),
                      "end": DateFormat.dateToStrType2(endDate),
                      "fields": [
                      {
                        "field": field,
                        "value": "0.0"
                      }
                      ]
                    };
                    datasetObj.push(createDataObjIfEmpty);
                  }

                  var fields = datasetObj[0].fields[0].field;
                  if (fields == 'steps') {
                    stepsData.push(datasetObj[0]);
                  }
                  if (fields == 'distance') {
                    //convert distance meter to km
                    var distanceInM = parseFloat(datasetObj[0].fields[0].value);
                    var distanceInKM = parseFloat(distanceInM/1000).toFixed(2);
                    datasetObj[0].fields[0].value = distanceInKM;
                    distanceData.push(datasetObj[0]);
                  }
                  if (fields == 'calories') {
                    // var distanceInM = parseFloat(datasetObj[0].fields[0].value);
                    // var distanceInKM = parseFloat(distanceInM/1000).toFixed(2);
                    // datasetObj[0].fields[0].value = distanceInKM;
                    caloriesData.push(datasetObj[0]);
                  }
                });
              });

              var responseData = {
                stepsData:stepsData,
                caloriesData:caloriesData,
                distanceData:distanceData
              };
              if (callBack) {
                callBack(responseData);
              }
            },
            function(e) {
              if (errorCallback) {
                errorCallback(e);
              }
              console.error('Android Googlefit Error '+ e);
            });
        }
      }
    },

    startActivityDataRecording: function(success, error){
      if (window.plugins != 'undefined') {
        if (window.plugins.googlefit != 'undefined') {
          window.plugins.googlefit.startActivityDataRecording(success, error);
        }
      }
    },

    stopActivityDataRecording: function(success, error){
      if (window.plugins != 'undefined') {
        if (window.plugins.googlefit != 'undefined') {
          window.plugins.googlefit.stopActivityDataRecording(success, error);
        }
      }
    },

    startActivityDataLiveUpdate: function(success, error){
      if (window.plugins != 'undefined') {
        if (window.plugins.googlefit != 'undefined') {
          window.plugins.googlefit.startActivityDataLiveUpdate(success, error);
        }
      }
    },

    stopActivityDataLiveUpdate: function(success, error){
      if (window.plugins != 'undefined') {
        if (window.plugins.googlefit != 'undefined') {
          window.plugins.googlefit.stopActivityDataLiveUpdate(success, error);
        }
      }
    },

    dataManager:{
      getDays:function(data){
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
        var daysFormated = [];
        angular.forEach(data, function(value, index){
          var ind = new Date(value.start).getDay();
          daysFormated.push(days[ind]);
        });
        return daysFormated;
      },
      getMonthDays:function(data){
        var daysFormated = [];
        angular.forEach(data, function(value, index){
          var ind = new Date(value.start).getDate();
          daysFormated.push(ind);
        });
        return daysFormated;
      },
      getYears:function(data){
        var daysFormated = [];
        var startMonth = new Date(data[0].start).getMonth();

        daysFormated.push(startMonth+1);

        angular.forEach(data, function(value, index){
          var currMonth = new Date(value.start).getMonth();
          if (startMonth != currMonth) {
            startMonth = currMonth;
            daysFormated.push(startMonth+1);
          }
        });
        return daysFormated;
      },

      getValuesByDay:function(data,fixed){
        fixed = (fixed == undefined)?0:fixed;
        var valueList = [];
        angular.forEach(data, function(value, index){
          var val = value.fields[0].value;
          valueList.push(parseFloat(val).toFixed(fixed));
        });
        return valueList;
      },
      getValuesByDayForYear:function(data,fixed){
        fixed = (fixed == undefined)?0:fixed;
        var valueList = [];

        if (data.length > 0) {
          var startMonth = new Date(data[0].start).getMonth();
          var sumVal = 0;
          angular.forEach(data, function(value, index){
            var currMonth = new Date(value.start).getMonth();
            var val = value.fields[0].value;

            if (startMonth == currMonth) {
              sumVal = sumVal + parseFloat(val);
            } else {
              valueList.push(sumVal.toFixed(fixed));
              sumVal = parseFloat(val);
              startMonth = currMonth;
            }           
          });
          valueList.push(sumVal.toFixed(fixed));
        }

        return valueList;
      },
      getHours:function(data){
        var hours = [];
        var label = "";
        for(var ind=0; ind<24;ind++) {
            // var ind = new Date(value.start).getHours();
            if (label.length == 0) {
              label = ind;
            }
            if ((ind+1) % hoursGroup == 0) {
              label += " - ";
              label += (ind+1);
              hours.push([label]);
              label = "";
            }
          }

          // angular.forEach(data, function(value, index){
          //   var ind = new Date(value.start).getHours();
          //   if (label.length == 0) {
          //     label = ind;
          //   }
          //   if ((index+1) % hoursGroup == 0) {
          //     ind = new Date(value.end).getHours();
          //     label += " - ";
          //     label += ind;
          //     hours.push([label]);
          //     label = "";
          //   }
          // });
          return hours;
        },
        getValuesByHours:function(data,fixed){
          if (!fixed) {
            fixed = 0;
          }
          var valueList = [];
          for (var j = 0; j < hoursGroup; j++) {
            var tempArr = [];
            for (var x = 0; x < (24/hoursGroup);x++) {
              tempArr.push(0);
            }
            valueList.push(tempArr);
          }
          angular.forEach(data, function(value, index){
            var val = value.fields[0].value;
            var pos = index % hoursGroup;
            var valInd = parseInt(index / hoursGroup);

            valueList[pos][valInd] = parseFloat(val).toFixed(fixed);
          });
          return valueList;
        },
        getTotalValue:function(data){
          var count = 0.0;
          angular.forEach(data, function(value, index){
            count = parseFloat(count) + parseFloat(value.fields[0].value);
          });
          return count;
        }
      }
    };
  });
