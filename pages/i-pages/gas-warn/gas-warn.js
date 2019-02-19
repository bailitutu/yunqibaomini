// pages/i-pages/gas-warn/gas-wa.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    gasWarnList:[]
  },
  addWarn(){
    wx.navigateTo({
      url: '../binding-warn/binding-warn',
    })
  },

  onShow(){
    this.getGasWarn();
  },
  // 获取报警器列表
  getGasWarn() {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });

    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doSelectYAlarm',
          data: {
            openId: openId
          }
        }, function (res) {
          that.setData({
            gasWarnList: res.alarmList,
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

  // 报警器解绑
  unbundling(e){  
      var that = this;
      wx.showModal({
        title: '提示',
        content: '确认解除绑定？',
        success:function(res){
          if(res.confirm){
            const { id } = e.currentTarget.dataset;
            app.requestFn({
              url: '/proapi/doDelAlarm',
              data: {
                id: id
              }
            }, function (res) {
              wx.hideLoading();
              that.getGasWarn();
            })
          }
        }
      })



  }


})