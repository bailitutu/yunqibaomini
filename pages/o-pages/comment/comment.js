// pages/o-pages/assess/assess.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    orderId:null,
    checkInfo:{},
    commentContent:null,
    noComment:false,
  },
  onLoad(options){
    if(options.orderId){
      this.setData({
        orderId:options.orderId
      })
    }
    this.getCheckInfo();
  },
  
  getCheckInfo(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doSecurityXQ',
      data: {
        orderId: that.data.orderId
      }
    }, function (res) {
      that.setData({
        checkInfo: res,
        commentContent: res.evaluation,
        noComment: !res.orderaudit ? true : false, 
        isReady:true
      })
      wx.hideLoading();
    })
  },
  // 填写评价
  inputComment(e){
    this.setData({
      commentContent:e.detail.value
    })
  },
  checkHandle(){
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '为了您的安全，请确认安检事项！',
      success:function(res){
        if(res.confirm){
          that.checkPassFn();
        }
      }
    })
  },
  // 安检评价
  checkPassFn(e){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.requestFn({
      url: '/proapi/doUpOrderaudit',
      data: {
        orderId: that.data.orderId,
        orderAudit:'2',
        evaluation: that.data.commentContent
      }
    }, function (res) {
      wx.hideLoading();
      wx.showModal({
        title: '提示',
        content: '提交成功',
        showCancel:false,
        success:function(){
          wx.switchTab({
            url: '/pages/order/order',
          });
        }
      })
    })
  }
})