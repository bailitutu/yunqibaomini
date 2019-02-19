// pages/m-pages/my-discount/my-discount.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isReady:false,
    discountList:[],
    noContentTips:'暂无优惠券',
    phone:''
  },
  onLoad:function(){
    this.getDiscount();
  },
  getDiscount(){
    var that = this;
    wx.showLoading({
      title: "Loading...",
      mask: true
    })

    app.getUserOpenId(function (err, openId) {
      if (!err) {
        app.requestFn({
          url: '/proapi/doEnCouponsmanage',
          data: {
            openId: openId
          }
        }, function (res) {
           if (res.couponlist){
            res.couponlist.map(function(item){
              console.log(item)
              if (item.specifications === '50kg'){
                item.discountName = 'YSP-50型'
              } else if (item.specifications === '15kg'){
                item.discountName = 'YSP-15型'
              } else if (item.specifications === '5kg'){
                item.discountName = 'YSP-5型'
              }
            })
            that.setData({
              discountList: res.couponlist,
              phone: res.phone,
              isReady: true
            });
            wx.hideLoading();

          }else{
            that.setData({
              discountList: res.couponlist,
              phone: res.phone,
              isReady: true
            });
            wx.hideLoading();
          }
    
        })
      } else {
        console.log(err);
        wx.hideLoading();
      }
    })

    


  }

  
})