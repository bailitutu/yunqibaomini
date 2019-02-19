// pages/o-pages/complaint/complaint.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    transitId:null,
    orderId:null,
    transitName:'',
    transitSupply:'',
    complaintContent:''
  },

  nameChange(e){
    this.setData({
      transitName:e.detail.value
    })
  },
  supplyChange(e){
    this.setData({
      transitSupply: e.detail.value
    })
  },
  contentChange(e) {
    this.setData({
      complaintContent: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.transitId){
      this.setData({
        transitId: options.transitId
      })
    }
    if (options.orderId){
      this.setData({
        orderId: options.orderId
      })
    }
    this.getTransitInfo();
  },

  // 获取配送员信息
  getTransitInfo(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })
    app.requestFn({
      url: '/proapi/doComplaint',
      data: {
        markiId: that.data.transitId,
      }
    }, function (res) {
      that.setData({
        transitName: res.markiName,
        transitSupply:res.supplyName,
        isReady:true,
      })
      wx.hideLoading();
    })

  },

  // 提交
  submitComplaint(){

    const { transitId, orderId, complaintContent} = this.data;

    if (!complaintContent || complaintContent == '') {
      wx.showModal({
        title: '提示',
        content: '请填写投诉内容',
      })
      return false;
    }
    
    wx.showLoading();

    app.requestFn({
      url: '/proapi/doSaveComplaint',
      data: {
        orderId: orderId,
        markiId: transitId,
        details: complaintContent
      }
    }, function (res) {
      wx.hideLoading();      
      wx.showModal({
        title: '提示',
        content: '投诉已提交',
        showCancel:false,
        success:function(res){
          wx.navigateBack();          
        }
      })
    })
  }
  
})