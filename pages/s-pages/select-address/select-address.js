// pages/s-pages/select-address/select-address.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    selectAddressId:null,
    addressList:[],
    supplyId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.addressId){
      this.setData({
        selectAddressId: options.addressId 
      })
    }
    if (options.supplyId) {
      this.setData({
        supplyId: options.supplyId
      })
    }

  },
  onShow:function(){
    this.getAddressList();
  },

    // 获取收货地址列表
  getAddressList(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    });
    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doGoodsReceivingList',
          data: {
            openId: openId,
            supplyId: that.data.supplyId
          }
        }, function (res) {
          that.setData({
            addressList: res.receicings,
            isReady:true,
          })
          wx.hideLoading();
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })
  },



  // 选择收货地址
  selectAddress(e){

    const { id,enable } = e.currentTarget.dataset;
    if(!enable){
      return false;
    }

    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    
    this.setData({
      selectAddressId: id
    })
    prevPage.setData({
      addressId: id
    })
    wx.navigateBack();
  },
  // 新增配送地址
  addAddress(){
    wx.navigateTo({
      url: '../../m-pages/add-address/add-address',
    })
  }


})