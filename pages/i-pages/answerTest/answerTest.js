// pages/i-pages/answerTest/answerTest.js
var app = getApp();
var timeOut ;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    testList:[],
    timeout:null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTestList();
  },

  // 获取试题列表
  getTestList(){
    var that = this;
    wx.showLoading({
      title:"Loading...",
      mask:true
    });
    app.requestFn({
      url: '/proapi/doEnGames',
    }, function (res) {
      if(!res.games.length){
        wx.showModal({
          title: '提示',
          content: '活动未开始或已结束',
          showCancel:false,
          success: function(res) {
            wx.navigateBack();
          },

        })
      }else{
        that.setData({
          testList: res.games,
          timeout: res.answertime,
          isReady: true
        })
      }
  
      wx.hideLoading();
      that.setTimeoutFn();
    })
  },

  // 选择选项
  selectAnswer(e){
    const {index,option} = e.currentTarget.dataset;
    var optionItem = 'testList['+ index +'].answer'

    this.setData({
      [optionItem]:  option
    })
  },
    // 判断是否全部答对
  submitFn(){
    const { testList} = this.data;
    var answerList =  []
    testList.map(function(item,index){
      if(!item.answer){
        answerList.push({
          hasAnswer:false,
          getAnswer: false,
          testIndex:index + 1
        })
      }  else if ( item.answer != item.key){
        answerList.push({
          hasAnswer: true,
          getAnswer :false,
            testIndex:index + 1
        })
      }else{
        answerList.push({
          hasAnswer: true,
          getAnswer: true,
          testIndex: index + 1
        })
      }
    })
    this.submitAnswer(answerList);
  },
  // 提交
  submitAnswer(answerList){
    var allHas = true,allRight = true,noAnswerList = [];
    
    answerList.map(function(item){
      if(!item.hasAnswer){
        allHas = false;
      }
      if(!item.getAnswer){
        allRight = false;
        noAnswerList.push({
          testIndex:item.testIndex
        })      
      }
    })
    if(!allHas){
      wx.showModal({
        title: '提示',
        content: '请答完所有试题',
        shwCancel:false
      })
      return false;
    }
    if(!allRight){
      var tips = '第';
      noAnswerList.map(function(cell,i){
        if (i === (noAnswerList.length-1)){
          tips += cell.testIndex;
        }else{
          tips += cell.testIndex + ',';
        }

      })
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: tips+'题没有答对哦！',
      })
      return false;
    }
    wx.showLoading({
      title: '正在提交...',
      mask: true
    })
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doGames',
          data: {
            openId:openId  
          }
        }, function (res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            content: res.status,
            showCancel:false,
            success:function(){
              wx.navigateBack();
            }
          })
        })
      } else {
        wx.hideLoading();
      }
    })
  },
  // 倒计时
  setTimeoutFn(){
    var that = this, stop = false, time = this.data.timeout ;    
    timeOut = setInterval(function(){
      if (time == 0) {
        clearInterval(timeOut);
        wx.showModal({
          title: '提示',
          content: '答题时间到,请重新答题！',
          showCancel:false,
          success:function(){
            wx.navigateBack();
          }
        })
        return false;
      }
      time--;
      that.setData({
        timeout: time
      })
    },1000);
  },
  onUnload(){
    clearInterval(timeOut);
  }
})