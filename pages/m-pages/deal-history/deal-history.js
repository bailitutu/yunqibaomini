// pages/m-pages/deal-history/deal-history.js
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    historyList:[],
    date:'',
    endDate:''
  },
  onLoad:function(){
    var nowTime = this.getCurrentTime();
    this.setData({
      date: nowTime,
      endDate:nowTime
    })

    this.getHistory();
  },
  getHistory(){
    var time = this.data.date;
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doAllRecord',
          data: {
            openId: openId,
            currentTime: time
          }
        }, function (res) {
          that.setData({
            historyList: res.transactionList,
            isReady:true
          })
          wx.hideLoading();

        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })

  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getHistory();
  },


  getCurrentTime(){
    var time = new Date();
    var year = time.getFullYear();
    var mouth = time.getMonth() + 1 < 10 ? '0' + (time.getMonth() + 1) : time.getMonth() + 1 ;
    var day = time.getDate() < 10 ? '0' + time.getDate() : time.getDate() ;
    var currentTime = year+'-'+ mouth+ '-'+ day
    return currentTime ;
  },
  checkHistoryDetail(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../deal-detail/deal-detail?id=' + id,
    })
  }
 
})