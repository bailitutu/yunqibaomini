var app = getApp();
Page({
  data: {
    isReady:false,
    addressList:[],
    selectAddressId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      selectAddressId: app.globalData.recId
    })
    this.getAddressList();
  },
  getAddressList() {
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function(err,openId){
      if(!err){
        app.requestFn({
          url: '/proapi/doEnReceivingList',
          data: {
            openId: openId
          }
        }, function (res) {

          that.setData({
            addressList: res.receicings,
            isReady:true
          })
          wx.hideLoading();
        })
      }else{
        console.log(err);
        wx.hideLoading();
      }

    })
    
  },
  
  // 选择收货地址
  selectAddress(e){
    const {id,address} = e.currentTarget.dataset;
    this.setData({
      selectAddressId:id
    })
    app.globalData.recId = id;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      hasChangeAddress:true,
      curr_address:address,
    })
    wx.navigateBack();
  }
})